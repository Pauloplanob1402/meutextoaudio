"use client";
import { useEffect, useRef, useState } from "react";
import { float32ToInt16, makeWavBlob, removeSilence } from "@/lib/toolkit";
import { formatDuration } from "@/lib/tts";
import { wavToMp3 } from "@/lib/mp3";
import { downloadBlob } from "./ui";

type Decoded = { samples: Float32Array; rate: number; name: string };
type Out = { url: string; wav: Blob; before: number; after: number; removed: number };

export default function Silence() {
  const [src, setSrc] = useState<Decoded | null>(null);
  const [out, setOut] = useState<Out | null>(null);
  const [thr, setThr] = useState(-45);
  const [minMs, setMinMs] = useState(500);
  const [keepMs, setKeepMs] = useState(150);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const lastUrl = useRef<string | null>(null);

  async function onFile(f?: File) {
    if (!f) return;
    setBusy(true);
    setMsg("Lendo o áudio…");
    setOut(null);
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const buf = await ctx.decodeAudioData(await f.arrayBuffer());
      const mono = new Float32Array(buf.length);
      for (let c = 0; c < buf.numberOfChannels; c++) {
        const ch = buf.getChannelData(c);
        for (let i = 0; i < ch.length; i++) mono[i] += ch[i] / buf.numberOfChannels;
      }
      const rate = buf.sampleRate;
      await ctx.close();
      setSrc({ samples: mono, rate, name: f.name.replace(/\.[^.]+$/, "") });
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Não foi possível abrir este arquivo. Use um arquivo MP3, WAV ou M4A.");
    } finally {
      setBusy(false);
    }
  }

  // refaz o corte quando os ajustes mudam
  useEffect(() => {
    if (!src) return;
    const t = setTimeout(() => {
      const r = removeSilence(src.samples, src.rate, { thresholdDb: thr, minSilenceMs: minMs, keepMs });
      const wav = makeWavBlob(float32ToInt16(r.out), src.rate);
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(wav);
      lastUrl.current = url;
      setOut({ url, wav, before: src.samples.length / src.rate, after: r.out.length / src.rate, removed: r.removedSec });
    }, 250);
    return () => clearTimeout(t);
  }, [src, thr, minMs, keepMs]);

  async function save() {
    if (!out || !src) return;
    setBusy(true);
    try {
      if (fmt === "mp3") {
        setMsg("Convertendo para MP3…");
        try {
          downloadBlob(await wavToMp3(out.wav), `${src.name}-sem-silencio.mp3`);
          setMsg("Download iniciado.");
          return;
        } catch (e) {
          console.error(e);
          setMsg("Não foi possível converter para MP3. O arquivo foi baixado em WAV.");
        }
      }
      downloadBlob(out.wav, `${src.name}-sem-silencio.wav`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="a">Sua gravação</label>
        <input id="a" type="file" accept="audio/*" onChange={(e) => onFile(e.target.files?.[0])} disabled={busy} />
        <span className="count">Funciona melhor com trechos de até 30 minutos. O resultado sai em mono, que é bom para voz.</span>
      </div>

      {src && (
        <>
          <div className="sliders">
            <label>Silêncio é tudo abaixo de {thr} dB (menor número = só corta o silêncio total)
              <input type="range" min={-70} max={-25} value={thr} onChange={(e) => setThr(Number(e.target.value))} />
            </label>
            <label>Só corta silêncios maiores que {minMs} ms
              <input type="range" min={200} max={3000} step={100} value={minMs} onChange={(e) => setMinMs(Number(e.target.value))} />
            </label>
            <label>Deixar {keepMs} ms de pausa em cada corte
              <input type="range" min={0} max={500} step={50} value={keepMs} onChange={(e) => setKeepMs(Number(e.target.value))} />
            </label>
          </div>

          {out && (
            <div className="result" aria-live="polite">
              <p className="count">De <b>{formatDuration(out.before)}</b> para <b className="ok">{formatDuration(out.after)}</b> · {Math.round(out.removed * 10) / 10} s de silêncio removidos</p>
              <audio controls src={out.url} style={{ marginTop: 12 }} />
              <div className="rrow" style={{ marginTop: 16 }}>
                <button className="btn" type="button" onClick={save} disabled={busy}>{busy ? "Preparando…" : `Baixar ${fmt.toUpperCase()}`}</button>
                <div className="speeds" role="group" aria-label="Formato">
                  {(["mp3", "wav"] as const).map((f) => <button key={f} type="button" className={fmt === f ? "on" : ""} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <p className="note" aria-live="polite">{msg || "Ouça o resultado antes de baixar. Se cortou demais, aumente o tempo mínimo ou deixe uma pausa maior."}</p>
    </div>
  );
}
