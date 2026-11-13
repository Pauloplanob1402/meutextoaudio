"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SAMPLE_TEXT, VOICE_ID, estimateSeconds, formatDuration, mergeParts, parseScript } from "@/lib/tts";
import { redirectVoiceDownloads, wasmPaths } from "@/lib/selfhost";
import { stretchWav } from "@/lib/stretch";
import { wavToMp3 } from "@/lib/mp3";

const HINT = "Dica: Ctrl + Enter também gera.";
const SPEEDS = [
  { label: "Mais devagar", v: 0.85 },
  { label: "Normal", v: 1 },
  { label: "Mais rápido", v: 1.2 },
];
const HEIGHTS = [30,55,40,75,50,90,35,65,85,45,70,30,95,55,40,80,60,35,75,50,90,40,65,30,85,55,45,70,35,60,80,40,95,50,65,30,75,45,55,85];

export default function Tool() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ReactNode>(HINT);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [speed, setSpeed] = useState(0.85);
  const [dlBusy, setDlBusy] = useState(false);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const original = useRef<Blob | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const au = useRef<HTMLAudioElement>(null);
  const res = useRef<HTMLDivElement>(null);
  const step = url ? 3 : text.trim() ? 2 : 1;
  const est = useMemo(() => estimateSeconds(text, speed), [text, speed]);

  // rascunho salvo só no navegador
  function update(v: string) {
    setText(v);
    try { localStorage.setItem("draft", v); } catch {}
  }
  useEffect(() => {
    try { const d = localStorage.getItem("draft"); if (d) setText(d); } catch {}
    if (window.matchMedia("(min-width:861px)").matches) ta.current?.focus();
  }, []);

  function applySpeed() {
    if (!au.current) return;
    au.current.playbackRate = speed;
    au.current.preservesPitch = true;
  }
  useEffect(applySpeed, [speed, url]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  async function generate() {
    if (busy) return;
    if (!text.trim()) {
      setStatus("É só colar um texto na caixa acima, ou tocar em “Usar um exemplo”.");
      ta.current?.focus();
      return;
    }
    setBusy(true);
    setUrl(null);
    setStatus("Preparando a voz… na primeira vez demora um pouco mais, depois é instantâneo.");
    try {
      const parts = parseScript(text);
      const total = parts.filter((p) => p.kind === "text").length;
      if (!total) throw new Error("sem texto");

      redirectVoiceDownloads();
      const tts = await import("@mintplex-labs/piper-tts-web");
      const session = await tts.TtsSession.create({
        voiceId: VOICE_ID as any,
        wasmPaths,
        progress: (p: any) => {
          if (p?.total && p.url !== "tts://inference-progress")
            setStatus(`Baixando a voz (só na primeira vez): ${Math.round((p.loaded * 100) / p.total)}%`);
        },
      });

      const out: (Blob | number)[] = [];
      const skipped: string[] = [];
      let done = 0;
      for (const p of parts) {
        if (p.kind === "pause") { out.push(p.seconds); continue; }
        done++;
        setStatus(`Gerando o áudio… (${done} de ${total})`);
        try {
          out.push(await session.predict(p.text));
        } catch {
          try { out.push(await session.predict(p.text)); }
          catch (e) { console.error("Trecho pulado:", p.text, e); skipped.push(p.text); }
        }
        await new Promise((r) => setTimeout(r, 0)); // deixa a tela respirar
      }
      if (!out.some((x) => typeof x !== "number")) throw new Error("nenhum trecho");

      setStatus("Montando o áudio final…");
      const merged = await mergeParts(out);
      original.current = merged;
      setUrl(URL.createObjectURL(merged));
      setStatus(
        skipped.length
          ? `Pronto, mas ${skipped.length} trecho(s) não puderam ser lidos. Tente dividir o texto em partes menores.`
          : "Pronto! Seu áudio está aqui."
      );
      requestAnimationFrame(() => res.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (e) {
      console.error(e);
      setStatus("Não consegui gerar o áudio agora. Recarregue a página (F5) e tente de novo, ou use um texto menor.");
    } finally {
      setBusy(false);
    }
  }

  // Baixa na velocidade escolhida (ajuste feito no navegador, sem mudar o tom), em MP3 ou WAV
  async function download(originalSpeed = false) {
    const src = original.current;
    if (!src || dlBusy) return;
    const sp = originalSpeed ? 1 : speed;
    setDlBusy(true);
    let out = src;
    let stretched = false;
    let warn = "";
    try {
      if (sp !== 1) {
        try {
          setStatus("Ajustando a velocidade…");
          out = await stretchWav(src, sp);
          stretched = true;
        } catch (e) {
          console.error(e);
          warn = "Não consegui ajustar a velocidade do arquivo, então baixei na velocidade original. ";
          out = src;
        }
      }

      let ext = "wav";
      if (fmt === "mp3") {
        try {
          setStatus("Convertendo para MP3…");
          out = await wavToMp3(out);
          ext = "mp3";
        } catch (e) {
          console.error(e);
          warn += "Não consegui converter para MP3, então baixei em WAV.";
        }
      }

      const a = document.createElement("a");
      const u = URL.createObjectURL(out);
      a.href = u;
      a.download = stretched ? `audio-${sp}x.${ext}` : `audio.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(u), 10000);
      setStatus(warn.trim() || "Pronto! Download iniciado.");
    } finally {
      setDlBusy(false);
    }
  }

  function insertPause() {
    const el = ta.current;
    const t = "\n\n[PAUSA - 2 segundos]\n\n";
    const a = el ? el.selectionStart : text.length;
    const z = el ? el.selectionEnd : text.length;
    update(text.slice(0, a) + t + text.slice(z));
    requestAnimationFrame(() => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = a + t.length; } });
  }

  function clear() {
    const saved = text;
    update("");
    setStatus(
      <>Texto apagado. <button className="link" type="button" onClick={() => { update(saved); setStatus("Texto de volta."); ta.current?.focus(); }}>Desfazer</button></>
    );
  }

  function again() {
    setUrl(null);
    update("");
    setStatus(HINT);
    window.scrollTo({ top: 0, behavior: "smooth" });
    ta.current?.focus();
  }

  return (
    <section className="stage" aria-labelledby="h">
      <h1 id="h">Cole o texto. Ouça em segundos.</h1>
      <p className="lead">Grátis, sem cadastro, e o seu texto não sai do seu aparelho.</p>

      <ol className="path" aria-label="Passo a passo">
        {["Cole seu texto", "Gere o áudio", "Ouça e baixe"].map((t, i) => (
          <li key={t} className={step === i + 1 ? "on" : step > i + 1 ? "done" : ""}><b>{i + 1}</b>{t}</li>
        ))}
      </ol>

      <div className="tool">
        <label className="big" htmlFor="txt">Cole ou escreva seu texto aqui</label>
        <textarea
          id="txt" ref={ta} value={text}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); generate(); } }}
          placeholder="Por exemplo: Olá! Este é o meu primeiro áudio."
        />
        <div className="aux">
          <button className="chip" type="button" onClick={() => { update(SAMPLE_TEXT); ta.current?.focus(); }}>Usar um exemplo</button>
          <button className="chip" type="button" onClick={insertPause}>Inserir pausa de 2 segundos</button>
          {text && <button className="chip" type="button" onClick={clear}>Limpar</button>}
        </div>
        {est > 0 && (
          <p className="note" style={{ margin: "-8px 0 16px" }}>
            Duração estimada do áudio: cerca de <b>{formatDuration(est)}</b>
          </p>
        )}
        <div className="row">
          <button className="btn go" type="button" onClick={generate} disabled={busy}>{busy ? "Gerando…" : "Gerar meu áudio"}</button>
          <p className="status" role="status" aria-live="polite">{status}</p>
        </div>

        {busy && (
          <div className="wave on" aria-hidden="true" style={{ marginTop: 16 }}>
            {HEIGHTS.map((h, i) => <b key={i} style={{ height: `${h}%`, ["--i" as string]: i }} />)}
          </div>
        )}

        {url && (
          <div className="result" ref={res}>
            <h2>Pronto! Seu áudio está aqui.</h2>
            <audio ref={au} src={url} controls onLoadedMetadata={applySpeed} />
            <div className="rrow" style={{ marginTop: 16 }}>
              <div className="speeds" role="group" aria-label="Velocidade">
                {SPEEDS.map((s) => (
                  <button key={s.v} type="button" className={speed === s.v ? "on" : ""} onClick={() => setSpeed(s.v)}>{s.label}</button>
                ))}
              </div>
              <div className="speeds" role="group" aria-label="Formato do arquivo">
                {(["mp3", "wav"] as const).map((f) => (
                  <button key={f} type="button" className={fmt === f ? "on" : ""} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>
                ))}
              </div>
              <button className="btn ghost" type="button" onClick={() => download()} disabled={dlBusy}>{dlBusy ? "Preparando…" : `Baixar ${fmt.toUpperCase()}`}</button>
            </div>
            <p className="note">O arquivo baixado sai na velocidade escolhida, já com as pausas. O MP3 é bem menor e abre em qualquer editor de vídeo. O WAV mantém a qualidade máxima, mas o arquivo é bem maior. Ajustes grandes de velocidade podem deixar a voz um pouco menos natural.</p>
            {speed !== 1 && <button className="link" type="button" onClick={() => download(true)} disabled={dlBusy}>Baixar na velocidade original</button>}
            <button className="link" type="button" onClick={again}>Gerar outro texto</button>
          </div>
        )}
        <p className="note">Na primeira vez, baixamos a voz (uns 60 MB). Depois fica instantâneo.</p>
      </div>
    </section>
  );
}
