"use client";
import { useEffect, useRef, useState } from "react";
import { Mp3Encoder } from "@breezystack/lamejs";
import {
  JOIN_RATE, MAX_MINUTES_MP3, MAX_MINUTES_WAV, MAX_TRACKS, TRANSITIONS,
  createJoiner, fmtDur, toInt16, wavFromInterleaved, type Chunk,
} from "@/lib/audioJoin";
import { downloadBlob } from "./ui";

type Item = { id: number; file: File; seconds: number | null };

// Lê só a duração do arquivo (rápido, sem decodificar tudo)
function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const a = new Audio();
    const url = URL.createObjectURL(file);
    const done = (v: number | null) => { URL.revokeObjectURL(url); resolve(v); };
    a.preload = "metadata";
    a.onloadedmetadata = () => done(isFinite(a.duration) ? a.duration : null);
    a.onerror = () => done(null);
    a.src = url;
  });
}

export default function AudioJoin() {
  const [items, setItems] = useState<Item[]>([]);
  const [trId, setTrId] = useState("direto");
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [kbps, setKbps] = useState(192);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [out, setOut] = useState<{ url: string; blob: Blob; seconds: number } | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState(false);
  const nextId = useRef(1);
  const input = useRef<HTMLInputElement>(null);
  const lastUrl = useRef<string | null>(null);

  useEffect(() => () => { if (lastUrl.current) URL.revokeObjectURL(lastUrl.current); }, []);

  const known = items.filter((i) => i.seconds != null);
  const total = known.reduce((n, i) => n + (i.seconds ?? 0), 0);
  const limit = (fmt === "mp3" ? MAX_MINUTES_MP3 : MAX_MINUTES_WAV) * 60;

  async function add(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f.name));
    if (!list.length) { setMsg("Use arquivos de áudio: MP3, WAV ou M4A."); return; }
    const room = MAX_TRACKS - items.length;
    if (list.length > room) setMsg(`O limite é de ${MAX_TRACKS} arquivos por vez. Os que passaram disso não entraram.`);
    else setMsg("");
    const added: Item[] = list.slice(0, Math.max(room, 0)).map((file) => ({ id: nextId.current++, file, seconds: null }));
    setItems((cur) => [...cur, ...added]);
    setOut(null);
    for (const it of added) {
      const s = await readDuration(it.file);
      setItems((cur) => cur.map((x) => (x.id === it.id ? { ...x, seconds: s } : x)));
    }
  }

  const move = (i: number, d: number) => {
    setItems((cur) => {
      const j = i + d;
      if (j < 0 || j >= cur.length) return cur;
      const c = [...cur];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
    setOut(null);
  };
  const remove = (id: number) => { setItems((c) => c.filter((x) => x.id !== id)); setOut(null); };
  const drop = (to: number) => {
    if (drag == null || drag === to) return;
    setItems((cur) => {
      const c = [...cur];
      const [m] = c.splice(drag, 1);
      c.splice(to, 0, m);
      return c;
    });
    setDrag(null);
    setOut(null);
  };

  async function join() {
    if (busy || items.length < 2) return;
    if (total > limit) { setMsg(`O total passa de ${limit / 60} minutos. Tire alguns arquivos ou escolha MP3.`); return; }
    setBusy(true);
    setOut(null);
    setMsg("");
    const tr = TRANSITIONS.find((t) => t.id === trId) ?? TRANSITIONS[0];
    const enc = fmt === "mp3" ? new Mp3Encoder(2, JOIN_RATE, kbps) : null;
    const mp3: Uint8Array[] = [];
    const wav: Int16Array[] = [];
    let frames = 0;
    const BLOCK = 1152 * 40;

    const sink = async (c: Chunk) => {
      frames += c.left.length;
      if (enc) {
        for (let i = 0; i < c.left.length; i += BLOCK) {
          const part = enc.encodeBuffer(toInt16(c.left.subarray(i, i + BLOCK)), toInt16(c.right.subarray(i, i + BLOCK)));
          if (part.length) mp3.push(new Uint8Array(part));
          await new Promise((r) => setTimeout(r, 0)); // deixa a tela respirar
        }
      } else {
        const l = toInt16(c.left), r = toInt16(c.right);
        const mix = new Int16Array(l.length * 2);
        for (let i = 0; i < l.length; i++) { mix[2 * i] = l[i]; mix[2 * i + 1] = r[i]; }
        wav.push(mix);
      }
    };

    const joiner = createJoiner(sink, tr);
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC({ sampleRate: JOIN_RATE }); // já converte cada arquivo para 44,1 kHz
    try {
      for (let i = 0; i < items.length; i++) {
        setMsg(`Juntando ${i + 1} de ${items.length}: ${items[i].file.name}`);
        const buf = await ctx.decodeAudioData(await items[i].file.arrayBuffer());
        const left = buf.getChannelData(0);
        const right = buf.numberOfChannels > 1 ? buf.getChannelData(1) : left;
        await joiner.add({ left, right });
      }
      await joiner.finish();
      let blob: Blob;
      if (enc) {
        const end = enc.flush();
        if (end.length) mp3.push(new Uint8Array(end));
        blob = new Blob(mp3 as BlobPart[], { type: "audio/mpeg" });
      } else {
        blob = wavFromInterleaved(wav);
      }
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      setOut({ url, blob, seconds: frames / JOIN_RATE });
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Não foi possível juntar. Algum arquivo pode estar com defeito ou em um formato que o seu navegador não abre. Tente MP3 ou WAV.");
    } finally {
      await ctx.close();
      setBusy(false);
    }
  }

  return (
    <div className="tool">
      <div
        className="field"
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files.length) add(e.dataTransfer.files); }}
        style={over ? { outline: "2px dashed var(--blue)", outlineOffset: 6, borderRadius: 12 } : undefined}
      >
        <span>Músicas e áudios (a ordem da lista é a ordem do arquivo final)</span>
        <div className="aux">
          <button className="btn go" type="button" onClick={() => input.current?.click()} disabled={busy}>Adicionar arquivos</button>
          <input ref={input} type="file" accept="audio/*,.mp3,.wav,.m4a" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
        </div>
        <span className="count">Você também pode arrastar os arquivos para cá. Até {MAX_TRACKS} arquivos.</span>
      </div>

      {items.length > 0 && (
        <ol className="blocks" style={{ listStyle: "none", padding: 0 }}>
          {items.map((it, i) => (
            <li
              key={it.id}
              draggable={!busy}
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); drop(i); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid var(--line)", opacity: drag === i ? 0.5 : 1 }}
            >
              <b aria-hidden="true">{i + 1}</b>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={it.file.name}>{it.file.name}</span>
              <span className="count">{it.seconds != null ? fmtDur(it.seconds) : "…"}</span>
              <button className="chip" type="button" onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label={`Subir ${it.file.name}`}>▲</button>
              <button className="chip" type="button" onClick={() => move(i, 1)} disabled={busy || i === items.length - 1} aria-label={`Descer ${it.file.name}`}>▼</button>
              <button className="chip" type="button" onClick={() => remove(it.id)} disabled={busy} aria-label={`Remover ${it.file.name}`}>Remover</button>
            </li>
          ))}
        </ol>
      )}
      {items.length > 0 && <p className="count">Duração total: <b className={total > limit ? "bad" : ""}>{fmtDur(total)}</b>{known.length < items.length ? " (calculando…)" : ""}</p>}

      <div className="field">
        <span>Entre uma faixa e outra</span>
        <div className="speeds" role="group" aria-label="Transição">
          {TRANSITIONS.map((t) => (
            <button key={t.id} type="button" className={trId === t.id ? "on" : ""} onClick={() => { setTrId(t.id); setOut(null); }}>{t.label}</button>
          ))}
        </div>
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
        <span className="count">MP3 gera um arquivo menor (até {MAX_MINUTES_MP3} minutos no total). WAV mantém a qualidade, mas o arquivo é bem maior (até {MAX_MINUTES_WAV} minutos).</span>
      </div>

      <div className="row">
        <button className="btn go" type="button" onClick={join} disabled={busy || items.length < 2}>{busy ? "Juntando…" : "Juntar em um só áudio"}</button>
        <p className="status" role="status" aria-live="polite">{msg || (items.length < 2 ? "Adicione pelo menos 2 arquivos." : "")}</p>
      </div>

      {out && (
        <div className="result">
          <h2>Seu áudio está pronto.</h2>
          <audio src={out.url} controls />
          <p className="note" style={{ marginTop: 8 }}>Duração: <b>{fmtDur(out.seconds)}</b> · {(out.blob.size / 1048576).toFixed(1)} MB</p>
          <div className="rrow" style={{ marginTop: 12 }}>
            <button className="btn ghost" type="button" onClick={() => downloadBlob(out.blob, `audios-juntos.${fmt}`)}>Baixar {fmt.toUpperCase()}</button>
          </div>
        </div>
      )}

      <p className="note">Tudo acontece no seu aparelho: os arquivos não são enviados a nenhum servidor. Junte só músicas e áudios que você tem o direito de usar: a responsabilidade pelo uso é de quem publica.</p>
    </div>
  );
}
