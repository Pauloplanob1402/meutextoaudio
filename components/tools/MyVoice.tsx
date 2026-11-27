"use client";
import { useEffect, useRef, useState } from "react";
import type { PocketTTS } from "@/lib/pocketTts";
import { parseScript, splitText } from "@/lib/tts";
import { wavToMp3 } from "@/lib/mp3";
import { fmtDur } from "@/lib/audioJoin";
import { downloadBlob, useStored } from "./ui";

const MAX_REF = 10; // segundos de referência
const MAX_CHARS = 3000;
const STORE = "minha-voz-ref";
const SENTENCE = "Oi, eu me chamo assim e hoje vou contar uma história para você. Presta atenção, porque o final vai surpreender.";
const QUALITY = [
  { id: "portuguese", label: "Rápida", hint: "Menor e mais rápida." },
  { id: "portuguese_24l", label: "Melhor qualidade", hint: "Mais camadas: soa melhor, mas baixa mais e é mais lenta." },
];

type Ref = { samples: Float32Array; rate: number; seconds: number; warn: string };

function toRef(ch: Float32Array, rate: number): Ref {
  const n = Math.min(ch.length, Math.round(MAX_REF * rate));
  const samples = ch.slice(0, n);
  let peak = 0, acc = 0;
  for (let i = 0; i < n; i++) { const a = Math.abs(samples[i]); if (a > peak) peak = a; acc += samples[i] * samples[i]; }
  const rmsDb = 20 * Math.log10(Math.sqrt(acc / Math.max(n, 1)) || 1e-9);
  let warn = "";
  if (n / rate < 3) warn = "A gravação ficou muito curta. Use de 5 a 10 segundos.";
  else if (rmsDb < -50) warn = "A gravação está quase sem som. Aproxime-se do microfone e grave de novo.";
  else if (peak > 0.99) warn = "A gravação estourou (som muito alto). Afaste-se um pouco do microfone e grave de novo.";
  return { samples, rate, seconds: n / rate, warn };
}

// guarda a gravação no aparelho (16 bits) para a pessoa não precisar gravar de novo
function save(r: Ref) {
  try {
    const i16 = new Int16Array(r.samples.length);
    for (let i = 0; i < i16.length; i++) i16[i] = Math.max(-1, Math.min(1, r.samples[i])) * 0x7fff;
    let bin = "";
    const u8 = new Uint8Array(i16.buffer);
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
    localStorage.setItem(STORE, JSON.stringify({ rate: r.rate, data: btoa(bin) }));
  } catch { /* sem espaço ou bloqueado: segue sem guardar */ }
}
function restore(): Ref | null {
  try {
    const j = JSON.parse(localStorage.getItem(STORE) || "null");
    if (!j?.data) return null;
    const bin = atob(j.data);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const i16 = new Int16Array(u8.buffer);
    const f = new Float32Array(i16.length);
    for (let i = 0; i < f.length; i++) f[i] = i16[i] / 0x7fff;
    return toRef(f, j.rate);
  } catch { return null; }
}

export default function MyVoice() {
  const [consent, setConsent] = useStored<boolean>("minha-voz-consentimento", false);
  const [ref, setRef] = useState<Ref | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [quality, setQuality] = useState("portuguese");
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "generating">("idle");
  const [msg, setMsg] = useState("");
  const [text, setText] = useStored<string>("minha-voz-texto", "");
  const [out, setOut] = useState<{ url: string; blob: Blob; seconds: number; rtfx: number } | null>(null);
  const [mobile, setMobile] = useState(false);
  const tts = useRef<PocketTTS | null>(null);
  const voice = useRef<string | null>(null);
  const loadedKey = useRef("");
  const stopRec = useRef<(() => void) | null>(null);
  const lastUrl = useRef<string | null>(null);
  const refUrl = useRef<string | null>(null);
  const [refPlay, setRefPlay] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobile(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    const r = restore();
    if (r) setReference(r, false);
    return () => {
      stopRec.current?.();
      tts.current?.destroy();
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      if (refUrl.current) URL.revokeObjectURL(refUrl.current);
    };
  }, []);

  function setReference(r: Ref, persist = true) {
    setRef(r); if (persist) save(r);
    voice.current = null; loadedKey.current = ""; // a voz precisa ser preparada de novo
    setPhase((p) => (p === "ready" ? "idle" : p)); setOut(null);
    // pequeno WAV para ouvir a gravação
    const i16 = new Int16Array(r.samples.length);
    for (let i = 0; i < i16.length; i++) i16[i] = Math.max(-1, Math.min(1, r.samples[i])) * 0x7fff;
    const h = new DataView(new ArrayBuffer(44));
    const w = (o: number, s: string) => [...s].forEach((c, i) => h.setUint8(o + i, c.charCodeAt(0)));
    w(0, "RIFF"); h.setUint32(4, 36 + i16.byteLength, true); w(8, "WAVE"); w(12, "fmt "); h.setUint32(16, 16, true);
    h.setUint16(20, 1, true); h.setUint16(22, 1, true); h.setUint32(24, r.rate, true); h.setUint32(28, r.rate * 2, true);
    h.setUint16(32, 2, true); h.setUint16(34, 16, true); w(36, "data"); h.setUint32(40, i16.byteLength, true);
    if (refUrl.current) URL.revokeObjectURL(refUrl.current);
    refUrl.current = URL.createObjectURL(new Blob([h.buffer, i16.buffer], { type: "audio/wav" }));
    setRefPlay(refUrl.current);
    setMsg(r.warn);
  }

  async function decode(buf: ArrayBuffer): Promise<Ref> {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    try {
      const a = await ctx.decodeAudioData(buf);
      return toRef(a.getChannelData(0), a.sampleRate);
    } finally { await ctx.close(); }
  }

  async function record() {
    if (recording || !consent) return;
    setMsg(""); setOut(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch {
      setMsg("Não consegui usar o microfone. Permita o acesso no navegador (ícone de cadeado ao lado do endereço) ou envie um arquivo de áudio.");
      return;
    }
    const mr = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const t0 = Date.now();
    let timer = 0;
    const finish = () => {
      clearInterval(timer);
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false); stopRec.current = null;
    };
    mr.onstop = async () => {
      finish();
      try { setReference(await decode(await new Blob(chunks, { type: mr.mimeType }).arrayBuffer())); }
      catch (e) { console.error(e); setMsg("Não foi possível ler a gravação. Tente de novo ou envie um arquivo."); }
    };
    stopRec.current = () => { if (mr.state !== "inactive") mr.stop(); else finish(); };
    mr.start();
    setRecording(true); setElapsed(0);
    timer = window.setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      setElapsed(s);
      if (s >= MAX_REF && mr.state !== "inactive") mr.stop();
    }, 100);
  }

  async function upload(f: File) {
    if (!consent) return;
    setMsg(""); setOut(null);
    try { setReference(await decode(await f.arrayBuffer())); }
    catch (e) { console.error(e); setMsg("Não foi possível ler esse arquivo. Use MP3, WAV ou M4A."); }
  }

  function forget() {
    try { localStorage.removeItem(STORE); } catch {}
    setRef(null); setRefPlay(null); voice.current = null; loadedKey.current = ""; setPhase("idle"); setOut(null); setMsg("Gravação apagada deste aparelho.");
  }

  async function prepare() {
    if (!ref || phase === "loading" || phase === "generating" || !consent) return;
    setPhase("loading"); setMsg("Preparando… Na primeira vez baixa o modelo de voz (uns 150 MB ou mais) e pode demorar.");
    try {
      const { PocketTTS } = await import("@/lib/pocketTts");
      const key = quality;
      if (!tts.current || loadedKey.current !== `q:${key}`) {
        tts.current?.destroy();
        const t = new PocketTTS({ language: quality, quantized: true, voiceCloning: true });
        await t.load((p) => {
          if (p.total) setMsg(`Baixando ${p.label ?? "o modelo"}: ${Math.round(((p.loaded ?? 0) * 100) / p.total)}%${p.fromCache ? " (já estava salvo)" : ""}`);
          else if (p.status) setMsg(p.status);
        });
        tts.current = t;
        loadedKey.current = `q:${key}`;
      }
      setMsg("Aprendendo a sua voz…");
      voice.current = await tts.current.cloneVoice(ref.samples, { inputSampleRate: ref.rate, name: "minha-voz" });
      setPhase("ready"); setMsg("Pronto! Agora escreva o texto e gere o áudio com a sua voz.");
    } catch (e) {
      console.error(e);
      tts.current?.destroy(); tts.current = null; loadedKey.current = ""; voice.current = null;
      setPhase("idle");
      setMsg("Não foi possível preparar a sua voz. Isto é um teste: use o Chrome ou o Edge no computador, com internet, e tente de novo. Se persistir, recarregue a página (F5).");
    }
  }

  async function generate() {
    const t = tts.current, v = voice.current;
    if (!t || !v || phase !== "ready" || !text.trim()) return;
    setPhase("generating"); setOut(null); setMsg("Gerando com a sua voz…");
    try {
      const chunks: Float32Array[] = [];
      const parts = parseScript(text);
      const pieces: ({ pause: number } | { text: string })[] = parts.flatMap((p): ({ pause: number } | { text: string })[] => (p.kind === "pause" ? [{ pause: p.seconds }] : splitText(p.text, 250).map((s) => ({ text: s }))));
      const total = pieces.filter((p) => "text" in p).length;
      let n = 0, genTime = 0, audio = 0;
      for (const p of pieces) {
        if ("pause" in p) { chunks.push(new Float32Array(Math.round(p.pause * t.sampleRate))); continue; }
        n++; setMsg(`Gerando com a sua voz… (${n} de ${total})`);
        const m = await t.generate(p.text, { voice: v, onChunk: (a) => { chunks.push(new Float32Array(a)); } });
        genTime += m.genTime; audio += m.audioDuration;
        if (m.stopped) break;
      }
      if (!chunks.length) throw new Error("sem áudio");
      const { chunksToWavBlob } = await import("@/lib/pocketTts");
      const blob = chunksToWavBlob(chunks, t.sampleRate) as Blob;
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      const seconds = chunks.reduce((a, c) => a + c.length, 0) / t.sampleRate;
      setOut({ url, blob, seconds, rtfx: genTime > 0 ? audio / genTime : 0 });
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Não foi possível gerar o áudio. Tente um texto menor ou prepare a voz de novo.");
    } finally {
      setPhase("ready");
    }
  }

  async function dlMp3() {
    if (!out) return;
    try { downloadBlob(await wavToMp3(out.blob), "minha-voz.mp3"); }
    catch (e) { console.error(e); setMsg("Não foi possível converter para MP3. Baixe o WAV."); }
  }

  const busy = phase === "loading" || phase === "generating";

  return (
    <div className="tool">
      <div role="note" style={{ border: "2px solid #b7791f", background: "rgba(183,121,31,0.10)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
        <p style={{ margin: 0 }}><b>BETA: recurso em teste.</b> Teste só no <b>computador</b>, com o Chrome ou o Edge. No celular pode ser muito lento ou travar. A voz clonada pode soar diferente da sua e errar a pronúncia de algumas palavras.</p>
        {mobile && <p style={{ margin: "8px 0 0" }}><b>Você parece estar no celular.</b> Recomendamos abrir esta página no computador.</p>}
      </div>

      <div className="field">
        <label className="check" style={{ alignItems: "flex-start" }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />{" "}
          <span>Declaro que esta é a <b>minha própria voz</b> (ou que tenho autorização da pessoa que fala) e que não vou usar o recurso para imitar ou enganar ninguém.</span>
        </label>
      </div>

      <div className="field" style={!consent ? { opacity: 0.5 } : undefined}>
        <span>1. Grave a sua voz (de 5 a 10 segundos)</span>
        <p className="count" style={{ margin: 0 }}>Em lugar silencioso, perto do microfone, leia no seu tom normal: “{SENTENCE}”</p>
        <div className="aux">
          {!recording
            ? <button className="btn go" type="button" onClick={record} disabled={!consent || busy}>{ref ? "Gravar de novo" : "Gravar"}</button>
            : <button className="btn go" type="button" onClick={() => stopRec.current?.()}>Parar ({elapsed.toFixed(1).replace(".", ",")} s)</button>}
          <button className="btn ghost" type="button" onClick={() => file.current?.click()} disabled={!consent || recording || busy}>Enviar um arquivo</button>
          <input ref={file} type="file" accept="audio/*,.mp3,.wav,.m4a" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          {ref && <button className="chip" type="button" onClick={forget} disabled={busy || recording}>Apagar a gravação</button>}
        </div>
        {ref && refPlay && (
          <>
            <audio src={refPlay} controls style={{ width: "100%", marginTop: 8 }} />
            <span className="count">Gravação: {fmtDur(ref.seconds)}. Fica só neste aparelho; nunca é enviada ao Sauim.</span>
          </>
        )}
      </div>

      <div className="field" style={!ref || !consent ? { opacity: 0.5 } : undefined}>
        <span>2. Prepare a sua voz</span>
        <div className="speeds" role="group" aria-label="Qualidade">
          {QUALITY.map((q) => <button key={q.id} type="button" className={quality === q.id ? "on" : ""} onClick={() => { setQuality(q.id); if (phase === "ready") setPhase("idle"); voice.current = null; }} disabled={busy}>{q.label}</button>)}
        </div>
        <span className="count">{QUALITY.find((q) => q.id === quality)?.hint} O modelo baixa uma vez e fica salvo no navegador.</span>
        <div className="aux">
          <button className="btn go" type="button" onClick={prepare} disabled={!ref || !consent || busy || recording || !!ref.warn && ref.seconds < 3}>{phase === "loading" ? "Preparando…" : phase === "ready" ? "Voz pronta (preparar de novo)" : "Preparar a minha voz"}</button>
        </div>
      </div>

      <div className="field" style={phase !== "ready" && phase !== "generating" ? { opacity: 0.5 } : undefined}>
        <label htmlFor="mv">3. O texto</label>
        <textarea id="mv" value={text} maxLength={MAX_CHARS} onChange={(e) => setText(e.target.value)} disabled={busy} placeholder="Escreva ou cole o texto. Pausas como [PAUSA - 2 segundos] funcionam." />
        <span className="count">{text.length.toLocaleString("pt-BR")} de {MAX_CHARS.toLocaleString("pt-BR")} caracteres (limite do beta).</span>
        <div className="aux">
          <button className="btn go" type="button" onClick={generate} disabled={phase !== "ready" || !text.trim()}>{phase === "generating" ? "Gerando…" : "Gerar com a minha voz"}</button>
          {phase === "generating" && <button className="btn ghost" type="button" onClick={() => tts.current?.stop()}>Parar</button>}
        </div>
      </div>

      <p className="status" role="status" aria-live="polite">{msg}</p>

      {out && (
        <div className="result">
          <h2>Áudio com a sua voz.</h2>
          <audio src={out.url} controls />
          <p className="note" style={{ marginTop: 8 }}>
            Duração: <b>{fmtDur(out.seconds)}</b>
            {out.rtfx > 0 && <> · {out.rtfx >= 1 ? `gerado ${out.rtfx.toFixed(1).replace(".", ",")}× mais rápido que a fala` : `gerado em ${(1 / out.rtfx).toFixed(1).replace(".", ",")}× o tempo da fala (lento neste aparelho)`}</>}
          </p>
          <div className="rrow" style={{ marginTop: 12 }}>
            <button className="btn ghost" type="button" onClick={dlMp3}>Baixar MP3</button>
            <button className="btn ghost" type="button" onClick={() => downloadBlob(out.blob, "minha-voz.wav")}>Baixar WAV</button>
          </div>
        </div>
      )}

      <p className="note">Tudo acontece no seu aparelho: a gravação e o texto não são enviados a servidor nenhum. Na primeira vez, o navegador baixa o modelo de voz do Hugging Face. O modelo é o Pocket TTS, © Kyutai, licença CC BY 4.0, que proíbe clonar uma voz sem o consentimento de quem fala. Não apresente o áudio gerado como se fosse uma gravação real de outra pessoa.</p>
    </div>
  );
}
