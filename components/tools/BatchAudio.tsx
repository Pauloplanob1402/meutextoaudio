"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { MAX_CHAPTERS, MAX_CHARS, fileName, splitChapters, summaryTxt, type SplitMode } from "@/lib/capitulos";
import { makeZip, type ZipFile } from "@/lib/zipStore";
import { formatDuration, mergeParts, parseScript, savedNarrationWpm } from "@/lib/tts";
import { SELF_HOST, redirectVoiceDownloads, wasmPaths } from "@/lib/selfhost";
import { stretchWav } from "@/lib/stretch";
import { wavToMp3 } from "@/lib/mp3";
import { VOICES, getVoice } from "@/lib/voices";
import { useToolHost } from "@/lib/toolHost";
import { countWords } from "@/lib/toolkit";
import { downloadBlob, useStored } from "./ui";

type Done = { blob: Blob; seconds: number; ext: "mp3" | "wav" };
type Session = { predict: (t: string) => Promise<Blob> };
const SPEEDS = [{ label: "Mais devagar", v: 0.85 }, { label: "Normal", v: 1 }, { label: "Mais rápido", v: 1.2 }];

// duração de um WAV mono de 16 bits, lida do cabeçalho
async function wavSeconds(b: Blob): Promise<number> {
  const v = new DataView(await b.slice(0, 44).arrayBuffer());
  const rate = v.getUint32(24, true) || 22050;
  return v.getUint32(40, true) / (rate * 2);
}

export default function BatchAudio() {
  const [text, setText] = useStored<string>("lote-texto", "");
  const [mode, setMode] = useState<SplitMode>("auto");
  const [minutes, setMinutes] = useState(10);
  const [speakTitle, setSpeakTitle] = useState(true);
  const [voiceId, setVoiceId] = useState("pt_BR-faber-medium");
  const [speed, setSpeed] = useState(1);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [wpm, setWpm] = useState(150);
  const [names, setNames] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, Done>>({});
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [cur, setCur] = useState(-1);
  const cancel = useRef(false);
  const host = useToolHost();

  useEffect(() => {
    setWpm(savedNarrationWpm());
    try { const v = localStorage.getItem("voz"); if (v) setVoiceId(getVoice(v).id); } catch {}
  }, []);

  const chapters = useMemo(() => splitChapters(text, mode, { minutes, wpm, speakTitle }), [text, mode, minutes, wpm, speakTitle]);
  // mudou o texto ou a divisão: o que já foi gerado deixa de valer
  useEffect(() => { setResults({}); setErrors({}); setNames({}); }, [text, mode, minutes, speakTitle, voiceId, speed, fmt]);

  const title = (i: number) => names[i] ?? chapters[i]?.title ?? `Parte ${i + 1}`;
  const secs = (i: number) => (countWords(chapters[i]?.text ?? "") / Math.max(wpm, 1)) * 60 / speed;
  const total = chapters.reduce((n, _, i) => n + secs(i), 0);
  const doneCount = chapters.filter((_, i) => results[i]).length;
  const tooBig = text.length > MAX_CHARS || chapters.length > MAX_CHAPTERS;
  const voice = getVoice(voiceId);
  const mainBusy = host.busy;

  async function openSession(): Promise<Session> {
    const tts = await import("@mintplex-labs/piper-tts-web");
    if (voice.engine === "kokoro") {
      const { createKokoro } = await import("@/lib/kokoro");
      return createKokoro({
        voice: voice.kokoro!,
        bits: { piperWasm: wasmPaths?.piperWasm ?? `${tts.WASM_BASE}.wasm`, piperData: wasmPaths?.piperData ?? `${tts.WASM_BASE}.data`, onnxWasm: wasmPaths?.onnxWasm ?? tts.ONNX_BASE },
        onProgress: (l, t) => setMsg(`Baixando a voz natural (só na primeira vez): ${Math.round((l * 100) / t)}%`),
      });
    }
    redirectVoiceDownloads(tts.PATH_MAP as Record<string, string>);
    (tts.TtsSession as any)._instance = undefined; // a biblioteca guarda uma sessão só: começamos limpo para garantir a voz escolhida
    return tts.TtsSession.create({
      voiceId: voiceId as any,
      wasmPaths,
      progress: (p: any) => { if (p?.total && p.url !== "tts://inference-progress") setMsg(`Baixando a voz (só na primeira vez): ${Math.round((p.loaded * 100) / p.total)}%`); },
    });
  }

  async function run() {
    if (busy || !chapters.length || tooBig || mainBusy) return;
    setBusy(true); cancel.current = false; setMsg("Preparando a voz… A primeira vez leva um pouco mais.");
    try {
      const session = await openSession();
      const ext = fmt;
      for (let i = 0; i < chapters.length; i++) {
        if (cancel.current) { setMsg("Parado. O que já ficou pronto continua aqui. Clique em gerar para continuar."); break; }
        if (results[i]) continue;
        setCur(i);
        setMsg(`Gerando o capítulo ${i + 1} de ${chapters.length}: ${title(i)}`);
        try {
          const parts = parseScript(chapters[i].text);
          const out: (Blob | number)[] = [];
          for (const p of parts) {
            if (cancel.current) throw new Error("cancel");
            if (p.kind === "pause") { out.push(p.seconds); continue; }
            try { out.push(await session.predict(p.text)); }
            catch { try { out.push(await session.predict(p.text)); } catch (e) { console.error("Trecho pulado:", p.text, e); } }
            await new Promise((r) => setTimeout(r, 0));
          }
          if (!out.some((x) => typeof x !== "number")) throw new Error("nenhum trecho");
          let wav = await mergeParts(out);
          if (speed !== 1) { try { wav = await stretchWav(wav, speed); } catch (e) { console.error(e); } }
          const seconds = await wavSeconds(wav);
          let blob = wav, e: "mp3" | "wav" = "wav";
          if (ext === "mp3") { try { blob = await wavToMp3(wav); e = "mp3"; } catch (er) { console.error(er); } }
          setResults((r) => ({ ...r, [i]: { blob, seconds, ext: e } }));
          setErrors((r) => { const n = { ...r }; delete n[i]; return n; });
        } catch (e) {
          if ((e as Error).message === "cancel") { setMsg("Parado. O que já ficou pronto continua aqui. Clique em gerar para continuar."); break; }
          console.error(e);
          setErrors((r) => ({ ...r, [i]: true }));
        }
      }
      setCur(-1);
      if (!cancel.current) setMsg("Terminou. Confira a lista abaixo e baixe tudo em um zip.");
    } catch (e) {
      console.error(e);
      try { ((await import("@mintplex-labs/piper-tts-web")).TtsSession as any)._instance = undefined; } catch {}
      setMsg(`Não foi possível gerar com a voz ${voice.name}. Escolha outra voz ou recarregue a página (F5) e tente novamente.`);
    } finally {
      setBusy(false); setCur(-1);
    }
  }

  async function zip() {
    if (zipBusy) return;
    const ready = chapters.map((_, i) => i).filter((i) => results[i]);
    if (!ready.length) return;
    setZipBusy(true);
    try {
      const rows = ready.map((i) => ({ title: title(i), seconds: results[i].seconds, file: fileName(i, chapters.length, title(i), results[i].ext) }));
      const files: ZipFile[] = ready.map((i, k) => ({ name: rows[k].file, data: results[i].blob }));
      files.push({ name: "sumario.txt", data: new TextEncoder().encode("﻿" + summaryTxt(rows)) });
      downloadBlob(await makeZip(files), "audiolivro-sauim.zip");
    } catch (e) {
      console.error(e);
      setMsg("Não foi possível montar o zip (muito grande para a memória). Baixe os capítulos um a um.");
    } finally {
      setZipBusy(false);
    }
  }

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="lote">Cole o texto longo (livro, curso ou série de episódios)</label>
        <textarea id="lote" value={text} onChange={(e) => setText(e.target.value)} disabled={busy} style={{ minHeight: 220 }}
          placeholder={"Cole tudo aqui. Os capítulos são achados por títulos como “Capítulo 1”, “Parte 2” ou “# Título”. Você também pode separá-los com uma linha só com ---."} />
        <p className="count">{countWords(text).toLocaleString("pt-BR")} palavras · até {MAX_CHAPTERS} capítulos e {MAX_CHARS.toLocaleString("pt-BR")} caracteres. O texto fica só neste aparelho. Pausas como [PAUSA - 2 segundos] funcionam aqui também.</p>
      </div>

      <div className="field">
        <span>Como dividir em capítulos</span>
        <div className="speeds" role="group" aria-label="Divisão">
          <button type="button" className={mode === "auto" ? "on" : ""} onClick={() => setMode("auto")} disabled={busy}>Pelos títulos</button>
          <button type="button" className={mode === "size" ? "on" : ""} onClick={() => setMode("size")} disabled={busy}>Por tamanho</button>
          {(mode === "size" || (chapters.length > 0 && chapters.every((c) => /^Parte \d+$/.test(c.title)))) && [5, 10, 15, 20].map((m) => (
            <button key={m} type="button" className={minutes === m ? "on" : ""} onClick={() => { setMinutes(m); setMode("size"); }} disabled={busy}>~{m} min</button>
          ))}
        </div>
        <label className="check"><input type="checkbox" checked={speakTitle} onChange={(e) => setSpeakTitle(e.target.checked)} disabled={busy} /> Falar o título no começo de cada capítulo</label>
        <span className="count">Sem títulos no texto, a divisão é por tamanho, sempre no fim de um parágrafo.</span>
      </div>

      <div className="field">
        <label htmlFor="vz">Voz</label>
        <select id="vz" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} disabled={busy}>
          {VOICES.filter((v) => !SELF_HOST || v.engine === "piper").map((v) => <option key={v.id} value={v.id}>{v.name} · {v.note}</option>)}
        </select>
        {voice.engine === "kokoro" && <span className="count">Vozes naturais são bem mais lentas. Para livros inteiros, prefira a Faber.</span>}
        <div className="speeds" role="group" aria-label="Velocidade" style={{ marginTop: 8 }}>
          {SPEEDS.map((s) => <button key={s.v} type="button" className={speed === s.v ? "on" : ""} onClick={() => setSpeed(s.v)} disabled={busy}>{s.label}</button>)}
          {(["mp3", "wav"] as const).map((f) => <button key={f} type="button" className={fmt === f ? "on" : ""} onClick={() => setFmt(f)} disabled={busy}>{f.toUpperCase()}</button>)}
        </div>
      </div>

      {chapters.length > 0 && (
        <div className="field">
          <span>{chapters.length} {chapters.length === 1 ? "capítulo" : "capítulos"} · cerca de {formatDuration(total)} no total</span>
          {tooBig && <p className="status" role="alert">O texto passou do limite. Divida em dois lotes.</p>}
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {chapters.map((c, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
                <b style={{ minWidth: 24 }}>{i + 1}</b>
                <input type="text" value={title(i)} maxLength={80} onChange={(e) => setNames({ ...names, [i]: e.target.value })} disabled={busy} aria-label={`Título do capítulo ${i + 1}`} style={{ flex: "1 1 200px", minWidth: 0 }} />
                <span className="count">{results[i] ? formatDuration(results[i].seconds) : `~${formatDuration(secs(i))}`}</span>
                {results[i] && <button className="chip" type="button" onClick={() => downloadBlob(results[i].blob, fileName(i, chapters.length, title(i), results[i].ext))}>Baixar</button>}
                <span className="count" role="status">{results[i] ? "Pronto" : errors[i] ? "Falhou" : cur === i ? "Gerando…" : ""}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {mainBusy && <p className="note" role="status">O Texto em áudio está gerando outro áudio. Espere terminar para começar o lote.</p>}
      <div className="row">
        <button className="btn go" type="button" onClick={run} disabled={busy || !chapters.length || tooBig || mainBusy}>
          {busy ? "Gerando…" : doneCount && doneCount < chapters.length ? "Continuar a gerar" : "Gerar todos os capítulos"}
        </button>
        {busy && <button className="btn ghost" type="button" onClick={() => { cancel.current = true; setMsg("Parando depois do trecho atual…"); }}>Parar</button>}
        {doneCount > 0 && <button className="btn ghost" type="button" onClick={zip} disabled={zipBusy || busy}>{zipBusy ? "Montando…" : `Baixar zip (${doneCount})`}</button>}
        <p className="status" role="status" aria-live="polite">{msg}</p>
      </div>
      {Object.keys(errors).length > 0 && !busy && <p className="note">Alguns capítulos falharam. Clique em “Continuar a gerar” para tentar só esses de novo.</p>}
      <p className="note">Mantenha esta aba aberta enquanto gera: a voz roda no seu aparelho, então um livro grande leva um bom tempo. O zip vem com os arquivos numerados (01-, 02-...) e um sumário com a duração de cada capítulo. Se você precisa de uma voz para um livro à venda, confira os termos da voz escolhida.</p>
    </div>
  );
}
