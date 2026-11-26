"use client";
import { useEffect, useRef, useState } from "react";
import { decodeTo16kMono } from "@/lib/legendaAudio";
import { blocksToSrt, cuesToBlocks, type Cue } from "@/lib/pacote";
import { fmtTime } from "@/lib/toolkit";
import { CopyButton, downloadText } from "@/components/tools/ui";

const MODELS = [
  { id: "onnx-community/whisper-tiny", label: "Pequeno (o mais rápido e leve, erra mais)" },
  { id: "onnx-community/whisper-base", label: "Médio (equilíbrio)" },
  { id: "onnx-community/whisper-small", label: "Grande (mais preciso, mais lento e mais pesado)" },
];
const LANGS = [
  { id: "portuguese", label: "Português" },
  { id: "auto", label: "Detectar sozinho" },
  { id: "english", label: "Inglês" },
  { id: "spanish", label: "Espanhol" },
];
const MAX_FILE_MB = 300;
const MAX_MIN = 45;

type Seg = { text: string; start: number; end: number };
type Phase = "parado" | "lendo" | "baixando" | "transcrevendo" | "pronto" | "erro";
type Metrics = { model: string; used: string; fallback: string; audioSec: number; totalSec: number; quick: boolean; decodeMs: number; loadMs: number; runMs: number; chunks: number };

const pt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const secs = (ms: number) => `${pt(ms / 1000)} s`;
const dur = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${Math.round(s)} s`);

function report(m: Metrics): string {
  const speed = m.runMs > 0 ? m.audioSec / (m.runMs / 1000) : 0;
  const nav = navigator as Navigator & { deviceMemory?: number; gpu?: unknown };
  const ten = speed > 0 ? dur((600 * 1000) / speed / 1000) : "?";
  return [
    "Relatório do protótipo da Legenda automática",
    `Modelo: ${m.model}`,
    `Processamento: ${m.used === "webgpu" ? "placa de vídeo (WebGPU)" : "processador (WASM)"}`,
    ...(m.fallback ? [`Aviso: ${m.fallback}`] : []),
    `Áudio testado: ${dur(m.audioSec)} de ${dur(m.totalSec)}${m.quick ? " (modo rápido)" : ""}`,
    `Leitura do arquivo: ${secs(m.decodeMs)}`,
    `Carregamento do modelo: ${secs(m.loadMs)}`,
    `Transcrição: ${secs(m.runMs)} (${pt(speed)}× a velocidade do áudio; acima de 1 é mais rápido que o áudio)`,
    `Estimativa para um vídeo de 10 minutos: ${ten}`,
    `Trechos de 30 s processados: ${m.chunks}`,
    `Aparelho: ${nav.hardwareConcurrency ?? "?"} núcleos, memória aproximada ${nav.deviceMemory ?? "?"} GB, WebGPU: ${nav.gpu ? "sim" : "não"}, isolamento entre origens: ${crossOriginIsolated ? "sim" : "não"}`,
    `Navegador: ${navigator.userAgent.slice(0, 140)}`,
  ].join("\n");
}

export default function LegendaPrototipo() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState(MODELS[1].id);
  const [device, setDevice] = useState<"auto" | "wasm">("auto");
  const [lang, setLang] = useState("portuguese");
  const [quick, setQuick] = useState(true);
  const [phase, setPhase] = useState<Phase>("parado");
  const [msg, setMsg] = useState("");
  const [pct, setPct] = useState<number | null>(null);
  const [segs, setSegs] = useState<Seg[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const worker = useRef<Worker | null>(null);
  const files = useRef(new Map<string, { loaded: number; total: number }>());

  useEffect(() => () => worker.current?.terminate(), []);

  const busy = phase === "lendo" || phase === "baixando" || phase === "transcrevendo";

  function stop() {
    worker.current?.terminate();
    worker.current = null;
  }
  function cancel() {
    stop();
    setPhase("parado");
    setMsg("Cancelado.");
    setPct(null);
  }
  function fail(m: string) {
    stop();
    setPhase("erro");
    setMsg(m);
    setPct(null);
  }

  async function run() {
    if (!file) return;
    setSegs([]);
    setMetrics(null);
    setPct(null);
    files.current.clear();
    if (file.size > MAX_FILE_MB * 1024 * 1024) return fail(`Este protótipo aceita arquivos de até ${MAX_FILE_MB} MB. Para um teste, use um trecho menor ou só o áudio.`);

    setPhase("lendo");
    setMsg("Lendo o arquivo e preparando o som…");
    let dec;
    try {
      dec = await decodeTo16kMono(file, quick ? 60 : undefined);
    } catch {
      return fail("Não consegui ler o som deste arquivo neste navegador. Tente um MP3, WAV ou MP4 comum.");
    }
    if (dec.seconds > MAX_MIN * 60) return fail(`Este protótipo aceita até ${MAX_MIN} minutos de áudio. Use o modo rápido (primeiros 60 segundos).`);

    setPhase("baixando");
    setMsg("Carregando o modelo de voz (na primeira vez ele é baixado e fica salvo no navegador)…");
    const w = new Worker(new URL("./legenda.worker.ts", import.meta.url), { type: "module" });
    worker.current = w;
    const expected = Math.max(1, Math.ceil(dec.seconds / 25));

    w.onmessage = (ev: MessageEvent) => {
      const d = ev.data as { type: string; [k: string]: unknown };
      if (d.type === "load") {
        const p = d.p as { status?: string; file?: string; loaded?: number; total?: number };
        if (p.status === "progress" && p.file && p.total) {
          files.current.set(p.file, { loaded: p.loaded ?? 0, total: p.total });
          let l = 0, t = 0;
          files.current.forEach((v) => { l += v.loaded; t += v.total; });
          if (t) setPct(Math.min(99, Math.round((l / t) * 100)));
        }
      } else if (d.type === "loaded") {
        setPhase("transcrevendo");
        setPct(0);
        setMsg("Transcrevendo…");
      } else if (d.type === "chunk") {
        setPct(Math.min(99, Math.round(((d.chunks as number) / expected) * 100)));
      } else if (d.type === "done") {
        const out = d.out as { text: string; chunks?: { text: string; timestamp: [number, number | null] }[] };
        const list: Seg[] = (out.chunks?.length ? out.chunks : [{ text: out.text, timestamp: [0, dec.seconds] as [number, number | null] }])
          .map((c) => ({ text: c.text.trim(), start: c.timestamp[0] ?? 0, end: c.timestamp[1] ?? dec.seconds }))
          .filter((c) => c.text);
        setSegs(list);
        setMetrics({
          model: MODELS.find((m) => m.id === model)?.id ?? model,
          used: d.used as string,
          fallback: d.fallback as string,
          audioSec: dec.seconds,
          totalSec: dec.totalSeconds,
          quick,
          decodeMs: dec.decodeMs,
          loadMs: d.loadMs as number,
          runMs: d.runMs as number,
          chunks: expected,
        });
        stop();
        setPhase("pronto");
        setPct(100);
        setMsg("Pronto.");
      } else if (d.type === "error") {
        fail(`Deu erro: ${String(d.message)}`);
      }
    };
    w.onerror = (ev) => fail(`O reconhecimento de voz não conseguiu iniciar: ${ev.message || "erro desconhecido"}`);
    w.postMessage({ type: "run", model, device, language: lang, audio: dec.data, seconds: dec.seconds }, [dec.data.buffer]);
  }

  const srt = segs.length
    ? blocksToSrt(
        cuesToBlocks(
          segs.map((s, i): Cue => ({ idx: i, text: s.text, start: s.start, end: s.end })),
          segs.map((s) => s.text)
        )
      )
    : "";
  const text = segs.map((s) => s.text).join(" ");
  const lines = segs.map((s) => `[${fmtTime(s.start)}] ${s.text}`).join("\n");

  return (
    <div className="tool" style={{ maxWidth: 820, margin: "24px auto" }}>
      <div className="field">
        <label htmlFor="lg-arq">Arquivo de áudio ou vídeo (até {MAX_FILE_MB} MB)</label>
        <input id="lg-arq" type="file" accept="audio/*,video/*" disabled={busy} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="lg-mod">Modelo</label>
        <select id="lg-mod" value={model} disabled={busy} onChange={(e) => setModel(e.target.value)}>
          {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="lg-proc">Processamento</label>
        <select id="lg-proc" value={device} disabled={busy} onChange={(e) => setDevice(e.target.value as "auto" | "wasm")}>
          <option value="auto">Automático (placa de vídeo, se o navegador tiver)</option>
          <option value="wasm">Só o processador (para comparar)</option>
        </select>
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="lg-idi">Idioma da fala</label>
        <select id="lg-idi" value={lang} disabled={busy} onChange={(e) => setLang(e.target.value)}>
          {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </div>
      <label className="note" style={{ display: "block", margin: "12px 0" }}>
        <input type="checkbox" checked={quick} disabled={busy} onChange={(e) => setQuick(e.target.checked)} /> Teste rápido: só os primeiros 60 segundos
      </label>

      <div className="rrow">
        <button className="btn go" type="button" onClick={run} disabled={!file || busy}>Transcrever</button>
        {busy && <button className="btn ghost" type="button" onClick={cancel}>Cancelar</button>}
      </div>

      {(msg || pct !== null) && (
        <div role="status" aria-live="polite" style={{ marginTop: 16 }}>
          <p className="note" style={{ margin: "0 0 6px" }}>{msg}{pct !== null && phase !== "pronto" ? ` (${pct}%)` : ""}</p>
          {pct !== null && phase !== "erro" && <progress value={pct} max={100} style={{ width: "100%" }} />}
        </div>
      )}

      {segs.length > 0 && metrics && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ margin: "0 0 8px" }}>Resultado</h2>
          <div className="out" style={{ maxHeight: 280, overflow: "auto" }}>{lines}</div>
          <div className="rrow" style={{ marginTop: 12 }}>
            <button className="btn ghost" type="button" onClick={() => downloadText(srt, "legenda-automatica.srt", "application/x-subrip")}>Baixar legenda (.srt)</button>
            <button className="btn ghost" type="button" onClick={() => downloadText(text, "transcricao.txt", "text/plain")}>Baixar texto (.txt)</button>
            <CopyButton text={text} label="Copiar texto" />
          </div>

          <h2 style={{ margin: "24px 0 8px" }}>Relatório de medição</h2>
          <p className="note" style={{ marginTop: 0 }}>Copie e me mande junto com a sua nota de 1 a 5 para a qualidade do texto (nomes, pontuação, trechos errados).</p>
          <div className="out">{report(metrics)}</div>
          <div className="rrow" style={{ marginTop: 12 }}><CopyButton text={report(metrics)} label="Copiar relatório" /></div>
        </div>
      )}
    </div>
  );
}
