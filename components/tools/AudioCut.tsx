"use client";
import { useEffect, useRef, useState } from "react";
import { Mp3Encoder } from "@breezystack/lamejs";
import { CUT_RATE, MAX_FILE_MB, MAX_MINUTES_DECODE, cutChannels, fmtTime, parseTime, peaks } from "@/lib/audioCut";
import { fmtDur, toInt16, wavFromInterleaved } from "@/lib/audioJoin";
import { downloadBlob } from "./ui";

type Loaded = { name: string; channels: Float32Array[]; seconds: number; wave: Float32Array; isVideo: boolean };

function mediaDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const el = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
    const url = URL.createObjectURL(file);
    const done = (v: number | null) => { URL.revokeObjectURL(url); resolve(v); };
    el.preload = "metadata";
    el.onloadedmetadata = () => done(isFinite(el.duration) ? el.duration : null);
    el.onerror = () => done(null);
    el.src = url;
  });
}

async function makeBlob(c: { left: Float32Array; right: Float32Array }, fmt: "mp3" | "wav", mono: boolean, kbps: number): Promise<Blob> {
  if (fmt === "wav") {
    const l = toInt16(c.left), r = toInt16(c.right);
    const mix = new Int16Array(l.length * 2);
    for (let i = 0; i < l.length; i++) { mix[2 * i] = l[i]; mix[2 * i + 1] = r[i]; }
    return wavFromInterleaved([mix], CUT_RATE);
  }
  const enc = new Mp3Encoder(mono ? 1 : 2, CUT_RATE, kbps);
  const parts: Uint8Array[] = [];
  const BLOCK = 1152 * 40;
  for (let i = 0; i < c.left.length; i += BLOCK) {
    const l = toInt16(c.left.subarray(i, i + BLOCK));
    const p = mono ? enc.encodeBuffer(l) : enc.encodeBuffer(l, toInt16(c.right.subarray(i, i + BLOCK)));
    if (p.length) parts.push(new Uint8Array(p));
    await new Promise((r) => setTimeout(r, 0));
  }
  const end = enc.flush();
  if (end.length) parts.push(new Uint8Array(end));
  return new Blob(parts as BlobPart[], { type: "audio/mpeg" });
}

export default function AudioCut() {
  const [file, setFile] = useState<Loaded | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [sTxt, setSTxt] = useState("0:00.0");
  const [eTxt, setETxt] = useState("0:00.0");
  const [fade, setFade] = useState(true);
  const [mono, setMono] = useState(false);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [kbps, setKbps] = useState(192);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [out, setOut] = useState<{ url: string; blob: Blob; seconds: number } | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lastUrl = useRef<string | null>(null);
  useEffect(() => () => { if (lastUrl.current) URL.revokeObjectURL(lastUrl.current); }, []);

  const total = file?.seconds ?? 0;
  const setS = (v: number) => { const x = Math.max(0, Math.min(v, Math.max(0, end - 0.1))); setStart(x); setSTxt(fmtTime(x)); setOut(null); };
  const setE = (v: number) => { const x = Math.min(total, Math.max(v, start + 0.1)); setEnd(x); setETxt(fmtTime(x)); setOut(null); };

  // desenha a forma da onda e o trecho escolhido
  useEffect(() => {
    const c = canvas.current;
    if (!c || !file) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = 96;
    c.width = w * dpr; c.height = h * dpr;
    const g = c.getContext("2d");
    if (!g) return;
    g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);
    const style = getComputedStyle(c);
    const base = style.getPropertyValue("--muted").trim() || "#9aa3b2";
    const accent = style.getPropertyValue("--blue").trim() || "#2563eb";
    const n = file.wave.length;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * w;
      const t = (i / n) * total;
      g.fillStyle = t >= start && t <= end ? accent : base;
      const bh = Math.max(1, file.wave[i] * (h - 6));
      g.fillRect(x, (h - bh) / 2, Math.max(1, w / n - 0.5), bh);
    }
  }, [file, start, end, total]);

  async function load(f: File) {
    if (busy) return;
    if (f.size > MAX_FILE_MB * 1048576) { setMsg(`O arquivo passa de ${MAX_FILE_MB} MB. Use um arquivo menor.`); return; }
    setBusy(true); setOut(null); setFile(null); setMsg("Lendo o arquivo…");
    const dur = await mediaDuration(f);
    if (dur && dur > MAX_MINUTES_DECODE * 60) { setMsg(`O arquivo passa de ${MAX_MINUTES_DECODE} minutos. Corte antes em um editor ou use um arquivo menor.`); setBusy(false); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC({ sampleRate: CUT_RATE });
    try {
      setMsg("Extraindo o áudio…");
      const buf = await ctx.decodeAudioData(await f.arrayBuffer());
      const ch = [buf.getChannelData(0), buf.numberOfChannels > 1 ? buf.getChannelData(1) : buf.getChannelData(0)];
      const seconds = buf.duration;
      setFile({ name: f.name, channels: ch, seconds, wave: peaks(ch[0], 400), isVideo: f.type.startsWith("video/") || /\.(mp4|mov|mkv|webm|avi)$/i.test(f.name) });
      setStart(0); setEnd(seconds); setSTxt(fmtTime(0)); setETxt(fmtTime(seconds));
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Não foi possível ler o áudio desse arquivo. O navegador pode não abrir esse formato (tente MP4, MOV, WEBM, MP3, WAV ou M4A) ou o vídeo pode não ter som.");
    } finally {
      await ctx.close();
      setBusy(false);
    }
  }

  async function make() {
    if (!file || busy || end - start < 0.1) return;
    setBusy(true); setMsg("Gerando o arquivo…");
    await new Promise((r) => setTimeout(r, 20));
    try {
      const cut = cutChannels(file.channels, CUT_RATE, start, end, fade ? 0.3 : 0, mono);
      const blob = await makeBlob(cut, fmt, mono, kbps);
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      setOut({ url, blob, seconds: cut.left.length / CUT_RATE });
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Não foi possível gerar o arquivo. Tente outro formato.");
    } finally {
      setBusy(false);
    }
  }

  const base = (file?.name ?? "audio").replace(/\.[^.]+$/, "");

  return (
    <div className="tool">
      <div
        className="field"
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) load(f); }}
        style={over ? { outline: "2px dashed var(--blue)", outlineOffset: 6, borderRadius: 12 } : undefined}
      >
        <span>Vídeo ou áudio</span>
        <div className="aux">
          <button className="btn go" type="button" onClick={() => input.current?.click()} disabled={busy}>Escolher arquivo</button>
          <input ref={input} type="file" accept="video/*,audio/*,.mp4,.mov,.webm,.mkv,.mp3,.wav,.m4a" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) load(f); e.target.value = ""; }} />
        </div>
        <span className="count">Ou arraste o arquivo para cá. Até {MAX_FILE_MB} MB e {MAX_MINUTES_DECODE} minutos. O arquivo não sai do seu aparelho.</span>
      </div>

      <p className="status" role="status" aria-live="polite">{msg}</p>

      {file && (
        <>
          <div className="result">
            <h2>{file.name}</h2>
            <p className="note">{file.isVideo ? "Áudio extraído do vídeo" : "Áudio"} · duração <b>{fmtDur(file.seconds)}</b></p>
            <canvas ref={canvas} role="img" aria-label="Forma da onda do áudio, com o trecho escolhido em destaque" style={{ width: "100%", height: 96, display: "block", marginTop: 8 }} />
          </div>

          <div className="field">
            <span>Trecho que você quer manter</span>
            <label htmlFor="ini">Começo</label>
            <input id="ini" type="range" min={0} max={total} step={0.1} value={start} onChange={(e) => setS(Number(e.target.value))} aria-valuetext={fmtTime(start)} />
            <input type="text" inputMode="decimal" value={sTxt} onChange={(e) => setSTxt(e.target.value)} onBlur={() => { const v = parseTime(sTxt); if (v == null) setSTxt(fmtTime(start)); else setS(v); }} aria-label="Começo (minutos:segundos)" style={{ maxWidth: 120 }} />
            <label htmlFor="fim">Fim</label>
            <input id="fim" type="range" min={0} max={total} step={0.1} value={end} onChange={(e) => setE(Number(e.target.value))} aria-valuetext={fmtTime(end)} />
            <input type="text" inputMode="decimal" value={eTxt} onChange={(e) => setETxt(e.target.value)} onBlur={() => { const v = parseTime(eTxt); if (v == null) setETxt(fmtTime(end)); else setE(v); }} aria-label="Fim (minutos:segundos)" style={{ maxWidth: 120 }} />
            <span className="count">Trecho escolhido: <b>{fmtTime(end - start)}</b>. Digite como 1:23,5 (minutos, segundos e décimos).</span>
            <div className="aux">
              <button className="chip" type="button" onClick={() => { setS(0); setE(total); }}>Usar o áudio inteiro</button>
            </div>
          </div>

          <div className="field">
            <label className="check"><input type="checkbox" checked={fade} onChange={(e) => { setFade(e.target.checked); setOut(null); }} /> Suavizar o começo e o fim (evita estalos)</label>
            <label className="check"><input type="checkbox" checked={mono} onChange={(e) => { setMono(e.target.checked); setOut(null); }} /> Gerar em mono (arquivo menor, bom para voz)</label>
          </div>
          <div className="field">
            <span>Formato do arquivo</span>
            <div className="speeds" role="group" aria-label="Formato">
              {(["mp3", "wav"] as const).map((f) => <button key={f} type="button" className={fmt === f ? "on" : ""} onClick={() => { setFmt(f); setOut(null); }}>{f.toUpperCase()}</button>)}
              {fmt === "mp3" && [128, 192].map((k) => <button key={k} type="button" className={kbps === k ? "on" : ""} onClick={() => { setKbps(k); setOut(null); }}>{k} kbps</button>)}
            </div>
          </div>

          <div className="row">
            <button className="btn go" type="button" onClick={make} disabled={busy || end - start < 0.1}>{busy ? "Gerando…" : "Cortar e gerar o áudio"}</button>
          </div>
        </>
      )}

      {out && (
        <div className="result">
          <h2>Áudio pronto.</h2>
          <audio src={out.url} controls />
          <p className="note" style={{ marginTop: 8 }}>Duração: <b>{fmtDur(out.seconds)}</b> · {(out.blob.size / 1048576).toFixed(1)} MB</p>
          <div className="rrow" style={{ marginTop: 12 }}>
            <button className="btn ghost" type="button" onClick={() => downloadBlob(out.blob, `${base}-trecho.${fmt}`)}>Baixar {fmt.toUpperCase()}</button>
          </div>
        </div>
      )}

      <p className="note">Aqui você tira o áudio de um vídeo e corta o trecho que precisa, tudo no seu aparelho. Para cortar ou converter o vídeo em si, use o seu editor. Se o vídeo é de outra pessoa, use só o que você tem direito de usar.</p>
    </div>
  );
}
