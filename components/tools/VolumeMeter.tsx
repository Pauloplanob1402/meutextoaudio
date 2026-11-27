"use client";
import { useEffect, useRef, useState } from "react";
import { Mp3Encoder } from "@breezystack/lamejs";
import { LOUD_RATE, MAX_MINUTES, TARGETS, applyGain, describe, fmtDb, fmtLufs, measure, planGain, type Measure } from "@/lib/audioLoud";
import { fmtDur, toInt16, wavFromInterleaved } from "@/lib/audioJoin";
import { downloadBlob } from "./ui";

type Loaded = { name: string; channels: Float32Array[]; m: Measure };

export default function VolumeMeter() {
  const [file, setFile] = useState<Loaded | null>(null);
  const [targetId, setTargetId] = useState("yt");
  const [limit, setLimit] = useState(true);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [kbps, setKbps] = useState(192);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [out, setOut] = useState<{ url: string; blob: Blob; after: Measure } | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const lastUrl = useRef<string | null>(null);
  useEffect(() => () => { if (lastUrl.current) URL.revokeObjectURL(lastUrl.current); }, []);

  const target = TARGETS.find((t) => t.id === targetId) ?? TARGETS[0];
  const plan = file ? planGain(file.m, target.lufs) : null;

  async function load(f: File) {
    if (busy) return;
    if (!(f.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f.name))) { setMsg("Use um arquivo de áudio: MP3, WAV ou M4A."); return; }
    setBusy(true); setOut(null); setFile(null); setMsg("Lendo o áudio…");
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC({ sampleRate: LOUD_RATE });
    try {
      const buf = await ctx.decodeAudioData(await f.arrayBuffer());
      if (buf.duration > MAX_MINUTES * 60) { setMsg(`O áudio passa de ${MAX_MINUTES} minutos. Corte em partes menores.`); return; }
      const channels = [buf.getChannelData(0), buf.numberOfChannels > 1 ? buf.getChannelData(1) : buf.getChannelData(0)];
      await new Promise((r) => setTimeout(r, 20));
      setMsg("Medindo o volume…");
      await new Promise((r) => setTimeout(r, 20));
      setFile({ name: f.name, channels, m: measure(channels) });
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Não foi possível abrir esse arquivo. Tente MP3 ou WAV.");
    } finally {
      await ctx.close();
      setBusy(false);
    }
  }

  async function make() {
    if (!file || !plan || busy) return;
    setBusy(true); setMsg("Ajustando e gerando o arquivo…");
    await new Promise((r) => setTimeout(r, 20));
    try {
      const adj = applyGain(file.channels, plan.gainDb, limit);
      const after = measure(adj);
      let blob: Blob;
      if (fmt === "mp3") {
        const enc = new Mp3Encoder(2, LOUD_RATE, kbps);
        const parts: Uint8Array[] = [];
        const BLOCK = 1152 * 40;
        for (let i = 0; i < adj[0].length; i += BLOCK) {
          const p = enc.encodeBuffer(toInt16(adj[0].subarray(i, i + BLOCK)), toInt16(adj[1].subarray(i, i + BLOCK)));
          if (p.length) parts.push(new Uint8Array(p));
          await new Promise((r) => setTimeout(r, 0));
        }
        const end = enc.flush();
        if (end.length) parts.push(new Uint8Array(end));
        blob = new Blob(parts as BlobPart[], { type: "audio/mpeg" });
      } else {
        const l = toInt16(adj[0]), r = toInt16(adj[1]);
        const mix = new Int16Array(l.length * 2);
        for (let i = 0; i < l.length; i++) { mix[2 * i] = l[i]; mix[2 * i + 1] = r[i]; }
        blob = wavFromInterleaved([mix], LOUD_RATE);
      }
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      setOut({ url, blob, after });
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
        <span>Seu áudio (narração, música ou o vídeo já mixado em áudio)</span>
        <div className="aux">
          <button className="btn go" type="button" onClick={() => input.current?.click()} disabled={busy}>Escolher arquivo</button>
          <input ref={input} type="file" accept="audio/*,.mp3,.wav,.m4a" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) load(f); e.target.value = ""; }} />
        </div>
        <span className="count">Você também pode arrastar o arquivo para cá. Até {MAX_MINUTES} minutos.</span>
      </div>

      <p className="status" role="status" aria-live="polite">{msg}</p>

      {file && plan && (
        <>
          <div className="result">
            <h2>{file.name}</h2>
            <p className="note">Duração: <b>{fmtDur(file.m.seconds)}</b></p>
            <p style={{ fontSize: "1.6rem", margin: "6px 0" }}><b>{fmtLufs(file.m.lufs)}</b></p>
            <p className="note">Pico mais alto: <b>{fmtDb(file.m.peakDb)}</b> (o máximo seguro é 0 dB).</p>
            <p className="note">{describe(file.m, target.lufs)}</p>
          </div>

          <div className="field">
            <span>Para onde vai este áudio?</span>
            <div className="speeds" role="group" aria-label="Alvo de volume">
              {TARGETS.map((t) => (
                <button key={t.id} type="button" className={targetId === t.id ? "on" : ""} onClick={() => { setTargetId(t.id); setOut(null); }}>{t.label}</button>
              ))}
            </div>
            <span className="count">{target.hint}</span>
          </div>

          {!file.m.silent && (
            <p className="note">
              Ajuste necessário: <b>{plan.gainDb >= 0 ? "+" : "−"}{Math.abs(plan.gainDb).toFixed(1).replace(".", ",")} dB</b>.
              {plan.willClip && (limit
                ? " O pico passaria do limite, então o limitador suave vai segurar os picos em −1 dB."
                : " Atenção: sem o limitador, os picos podem distorcer.")}
            </p>
          )}

          <div className="field">
            <label className="check">
              <input type="checkbox" checked={limit} onChange={(e) => { setLimit(e.target.checked); setOut(null); }} /> Segurar os picos em −1 dB (limitador suave)
            </label>
          </div>
          <div className="field">
            <span>Formato do arquivo final</span>
            <div className="speeds" role="group" aria-label="Formato">
              {(["mp3", "wav"] as const).map((f) => (
                <button key={f} type="button" className={fmt === f ? "on" : ""} onClick={() => { setFmt(f); setOut(null); }}>{f.toUpperCase()}</button>
              ))}
              {fmt === "mp3" && [128, 192].map((k) => (
                <button key={k} type="button" className={kbps === k ? "on" : ""} onClick={() => { setKbps(k); setOut(null); }}>{k} kbps</button>
              ))}
            </div>
          </div>

          <div className="row">
            <button className="btn go" type="button" onClick={make} disabled={busy || file.m.silent}>{busy ? "Gerando…" : `Ajustar para ${target.lufs.toString().replace("-", "−")} LUFS`}</button>
          </div>
        </>
      )}

      {out && (
        <div className="result">
          <h2>Áudio ajustado.</h2>
          <audio src={out.url} controls />
          <p className="note" style={{ marginTop: 8 }}>Agora: <b>{fmtLufs(out.after.lufs)}</b> · pico {fmtDb(out.after.peakDb)} · {(out.blob.size / 1048576).toFixed(1)} MB</p>
          <div className="rrow" style={{ marginTop: 12 }}>
            <button className="btn ghost" type="button" onClick={() => downloadBlob(out.blob, `${base}-ajustado.${fmt}`)}>Baixar {fmt.toUpperCase()}</button>
          </div>
        </div>
      )}

      <p className="note">Tudo acontece no seu aparelho: o áudio não é enviado a nenhum servidor. A medição segue o padrão usado pelas plataformas (ITU-R BS.1770). Se o MP3 final mudar 0,1 ou 0,2 dB, é normal: é a compressão.</p>
    </div>
  );
}
