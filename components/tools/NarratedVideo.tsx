"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUNDS, FORMATS, MAX_SECONDS, activeCue, isSrt, parseSrt, pickMime, wrapLines, type Cue } from "@/lib/videoNarrado";
import { buildSrt } from "@/lib/toolkit";
import { fmtDur } from "@/lib/audioJoin";
import { downloadBlob, useStored } from "./ui";

type Look = { bg: (typeof BACKGROUNDS)[number]; img: HTMLImageElement | null; center: boolean; bar: boolean };

function draw(g: CanvasRenderingContext2D, w: number, h: number, look: Look, cue: Cue | null, t: number, total: number) {
  const grad = g.createLinearGradient(0, 0, w * 0.4, h);
  grad.addColorStop(0, look.bg.a); grad.addColorStop(1, look.bg.b);
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  if (look.img) {
    const im = look.img;
    const k = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const iw = im.naturalWidth * k, ih = im.naturalHeight * k;
    g.drawImage(im, (w - iw) / 2, (h - ih) / 2, iw, ih);
    g.fillStyle = "rgba(0,0,0,0.38)"; g.fillRect(0, 0, w, h); // escurece para a legenda ficar legível
  }
  if (cue) {
    const size = Math.round(Math.min(w, h) * 0.072);
    g.font = `800 ${size}px system-ui, "Segoe UI", Roboto, Arial, sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
    const lines = wrapLines(cue.text, w * 0.84, (s) => g.measureText(s).width);
    const lh = size * 1.28;
    const blockH = lines.length * lh;
    const cy = look.center ? h / 2 : h * 0.76;
    const y0 = Math.min(h - blockH / 2 - 24, cy) - blockH / 2 + lh / 2;
    lines.forEach((l, i) => {
      const y = y0 + i * lh;
      g.lineWidth = size * 0.22; g.strokeStyle = "rgba(0,0,0,0.85)"; g.strokeText(l, w / 2, y);
      g.fillStyle = "#fff"; g.fillText(l, w / 2, y);
    });
  }
  if (look.bar && total > 0) {
    g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(0, h - 8, w, 8);
    g.fillStyle = "#fff"; g.fillRect(0, h - 8, w * Math.min(1, t / total), 8);
  }
}

export default function NarratedVideo() {
  const [audio, setAudio] = useState<{ name: string; buf: AudioBuffer } | null>(null);
  const [script, setScript] = useStored<string>("video-legenda-texto", "");
  const [fmtId, setFmtId] = useState<"vertical" | "horizontal" | "quadrado">("vertical");
  const [bgId, setBgId] = useState("noite");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [center, setCenter] = useState(true);
  const [bar, setBar] = useState(true);
  const [mode, setMode] = useState<"idle" | "preview" | "record">("idle");
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [out, setOut] = useState<{ url: string; blob: Blob; ext: string } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stop = useRef<(() => void) | null>(null);
  const lastUrl = useRef<string | null>(null);
  const aIn = useRef<HTMLInputElement>(null);
  const iIn = useRef<HTMLInputElement>(null);
  const [mimeInfo, setMimeInfo] = useState<{ mime: string; ext: "mp4" | "webm" } | null>(null);

  const fmt = FORMATS.find((f) => f.id === fmtId) ?? FORMATS[0];
  const bg = BACKGROUNDS.find((b) => b.id === bgId) ?? BACKGROUNDS[0];
  const dur = audio?.buf.duration ?? 0;
  const exact = isSrt(script);
  const cues = useMemo(() => {
    if (!script.trim()) return [];
    if (exact) return parseSrt(script);
    if (!dur) return [];
    return parseSrt(buildSrt(script, dur).srt);
  }, [script, exact, dur]);

  useEffect(() => {
    setMimeInfo(typeof MediaRecorder !== "undefined" ? pickMime((t) => MediaRecorder.isTypeSupported(t)) : null);
    return () => { stop.current?.(); if (lastUrl.current) URL.revokeObjectURL(lastUrl.current); };
  }, []);

  // quadro de prévia parado (mostra a primeira legenda)
  useEffect(() => {
    const c = canvas.current;
    if (!c || mode !== "idle") return;
    c.width = fmt.w; c.height = fmt.h;
    const g = c.getContext("2d");
    if (g) draw(g, fmt.w, fmt.h, { bg, img, center, bar }, cues[0] ?? { start: 0, end: 1, text: "Sua legenda aparece aqui" }, 0, dur);
  }, [fmt, bg, img, center, bar, cues, dur, mode]);

  async function loadAudio(f: File) {
    setOut(null); setMsg("Lendo o áudio…");
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    try {
      const buf = await ctx.decodeAudioData(await f.arrayBuffer());
      if (buf.duration > MAX_SECONDS) { setMsg(`O áudio passa de ${MAX_SECONDS / 60} minutos. A gravação do vídeo acontece em tempo real, então use trechos de até ${MAX_SECONDS / 60} minutos.`); return; }
      setAudio({ name: f.name, buf }); setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Não foi possível ler esse áudio. Use MP3, WAV ou M4A.");
    } finally { await ctx.close(); }
  }
  function loadImage(f: File) {
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => { setImg(im); setOut(null); };
    im.onerror = () => { URL.revokeObjectURL(url); setMsg("Não foi possível abrir essa imagem."); };
    im.src = url;
  }

  // preview = toca o vídeo na tela; record = grava o arquivo (em tempo real)
  async function go(kind: "preview" | "record") {
    if (!audio || mode !== "idle") return;
    if (kind === "record" && !mimeInfo) { setMsg("Este navegador não grava vídeo. Use o Chrome, o Edge ou o Safari atualizados."); return; }
    const c = canvas.current; if (!c) return;
    c.width = fmt.w; c.height = fmt.h;
    const g = c.getContext("2d"); if (!g) return;
    setOut(null); setMode(kind); setProgress(0);
    setMsg(kind === "record" ? "Gravando o vídeo em tempo real. Deixe esta aba aberta e visível até terminar." : "");
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    await ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = audio.buf;
    const look: Look = { bg, img, center, bar };
    let rec: MediaRecorder | null = null;
    const chunks: Blob[] = [];
    let raf = 0, finished = false;

    const end = (ok: boolean) => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      try { src.stop(); } catch {}
      const done = () => { ctx.close(); setMode("idle"); setProgress(0); };
      if (rec && rec.state !== "inactive") { rec.onstop = () => { finalize(ok); done(); }; rec.stop(); }
      else { done(); if (kind === "preview") setMsg(""); }
    };
    const finalize = (ok: boolean) => {
      if (!ok || !chunks.length || !mimeInfo) { setMsg(ok ? "A gravação saiu vazia. Tente de novo." : "Gravação cancelada."); return; }
      const blob = new Blob(chunks, { type: mimeInfo.mime.split(";")[0] });
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      setOut({ url, blob, ext: mimeInfo.ext });
      setMsg("");
    };
    const onVis = () => { if (document.hidden && kind === "record") setMsg("A aba ficou em segundo plano. O navegador pode congelar a imagem. Volte para esta aba."); };
    document.addEventListener("visibilitychange", onVis);
    stop.current = () => end(false);

    if (kind === "record" && mimeInfo) {
      const dest = ctx.createMediaStreamDestination();
      src.connect(dest);
      const stream = c.captureStream(30);
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
      rec = new MediaRecorder(stream, { mimeType: mimeInfo.mime, videoBitsPerSecond: 4_000_000, audioBitsPerSecond: 128_000 });
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.start(500);
    } else src.connect(ctx.destination);

    const t0 = ctx.currentTime + 0.05;
    src.start(t0);
    const tick = () => {
      const t = Math.max(0, ctx.currentTime - t0);
      draw(g, fmt.w, fmt.h, look, activeCue(cues, t), t, dur);
      setProgress(Math.min(1, t / dur));
      if (t >= dur + 0.4) { end(true); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  const busy = mode !== "idle";
  const ready = !!audio && cues.length > 0;

  return (
    <div className="tool">
      <div className="field">
        <span>1. A narração (MP3, WAV ou M4A)</span>
        <div className="aux">
          <button className="btn go" type="button" onClick={() => aIn.current?.click()} disabled={busy}>{audio ? "Trocar o áudio" : "Escolher o áudio"}</button>
          <input ref={aIn} type="file" accept="audio/*,.mp3,.wav,.m4a" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) loadAudio(f); e.target.value = ""; }} />
        </div>
        {audio && <span className="count">{audio.name} · {fmtDur(dur)}</span>}
        <span className="count">Pode ser o áudio que você gerou no Texto em áudio.</span>
      </div>

      <div className="field">
        <label htmlFor="vtxt">2. O texto da legenda</label>
        <textarea id="vtxt" value={script} onChange={(e) => { setScript(e.target.value); setOut(null); }} disabled={busy}
          placeholder={"Cole o texto da narração (a legenda é espalhada pela duração do áudio, de forma aproximada) ou cole o conteúdo de um arquivo .srt (a legenda fica no tempo exato)."} />
        <span className="count">{script.trim() ? (exact ? `Legenda no tempo exato: ${cues.length} falas.` : cues.length ? `Legenda aproximada: ${cues.length} falas, distribuídas pela duração. Para o tempo exato, use o .srt do Pacote do vídeo.` : "Escolha o áudio para calcular as falas.") : "Dica: o Pacote do vídeo, depois de gerar o áudio, entrega o .srt com o tempo exato."}</span>
      </div>

      <div className="field">
        <span>3. O visual</span>
        <div className="speeds" role="group" aria-label="Formato">
          {FORMATS.map((f) => <button key={f.id} type="button" className={fmtId === f.id ? "on" : ""} onClick={() => { setFmtId(f.id); setOut(null); }} disabled={busy}>{f.label}</button>)}
        </div>
        <div className="speeds" role="group" aria-label="Fundo" style={{ marginTop: 8 }}>
          {BACKGROUNDS.map((b) => <button key={b.id} type="button" className={bgId === b.id && !img ? "on" : ""} onClick={() => { setBgId(b.id); setImg(null); setOut(null); }} disabled={busy}>{b.label}</button>)}
          <button type="button" className={img ? "on" : ""} onClick={() => iIn.current?.click()} disabled={busy}>{img ? "Trocar a imagem" : "Minha imagem"}</button>
          <input ref={iIn} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImage(f); e.target.value = ""; }} />
        </div>
        <label className="check"><input type="checkbox" checked={center} onChange={(e) => { setCenter(e.target.checked); setOut(null); }} disabled={busy} /> Legenda no centro (desligado: na parte de baixo)</label>
        <label className="check"><input type="checkbox" checked={bar} onChange={(e) => { setBar(e.target.checked); setOut(null); }} disabled={busy} /> Barra de progresso embaixo</label>
      </div>

      <div style={{ maxWidth: fmt.id === "horizontal" ? "100%" : 320, margin: "8px 0" }}>
        <canvas ref={canvas} role="img" aria-label="Prévia do vídeo" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, background: "#000" }} />
        {busy && <div style={{ height: 4, background: "var(--line)", marginTop: 6 }}><div style={{ height: 4, width: `${progress * 100}%`, background: "var(--blue)" }} /></div>}
      </div>

      <div className="row">
        <button className="btn ghost" type="button" onClick={() => go("preview")} disabled={!ready || busy}>Ver a prévia</button>
        <button className="btn go" type="button" onClick={() => go("record")} disabled={!ready || busy}>{mode === "record" ? "Gravando…" : "Gerar o vídeo"}</button>
        {busy && <button className="btn ghost" type="button" onClick={() => stop.current?.()}>Parar</button>}
        <p className="status" role="status" aria-live="polite">{msg || (!audio ? "Escolha o áudio para começar." : !cues.length ? "Cole o texto da legenda." : "")}</p>
      </div>

      {out && (
        <div className="result">
          <h2>Vídeo pronto.</h2>
          <video src={out.url} controls style={{ maxWidth: "100%", maxHeight: 480, borderRadius: 12 }} />
          <p className="note" style={{ marginTop: 8 }}>{(out.blob.size / 1048576).toFixed(1)} MB · arquivo .{out.ext}</p>
          {out.ext === "webm" && <p className="note">Este navegador gravou em WebM. O YouTube aceita, mas alguns editores não abrem. No Chrome atualizado, no Edge ou no Safari, o arquivo sai em MP4.</p>}
          <div className="rrow" style={{ marginTop: 12 }}>
            <button className="btn ghost" type="button" onClick={() => downloadBlob(out.blob, `video-narrado.${out.ext}`)}>Baixar .{out.ext}</button>
          </div>
        </div>
      )}

      <p className="note">O vídeo é gravado no seu aparelho, em tempo real: um áudio de 3 minutos leva 3 minutos para gravar. Não troque de aba nem bloqueie a tela enquanto grava. Nada é enviado a nenhum servidor. Use só imagens e músicas que você tem direito de usar.</p>
    </div>
  );
}
