"use client";
// Acabamento da voz clonada (Minha voz): filtro de graves, volume em LUFS e verificação da gravação de referência.
// Lógica sem tela. Usa a medição de loudness que o site já tem (lib/audioLoud.ts).
import { LOUD_RATE, applyGain, measure, planGain } from "@/lib/audioLoud";

export const VOICE_TARGET_LUFS = -16; // voz e podcast
const CEILING_DB = -1.5;

// ---------- verificação da gravação de referência ----------

const db = (x: number) => 20 * Math.log10(x || 1e-9);

// Devolve avisos em português (lista vazia = gravação boa). O de eco é uma ESTIMATIVA: mede em quanto tempo
// a voz some depois de cada frase/palavra; em sala com eco a voz demora mais para "morrer".
export function checkReference(x: Float32Array, rate: number): string[] {
  const out: string[] = [];
  const n = x.length;
  if (n / rate < 3) { out.push("A gravação ficou muito curta. Use de 5 a 10 segundos."); return out; }

  let clip = 0, acc = 0;
  for (let i = 0; i < n; i++) { if (Math.abs(x[i]) >= 0.99) clip++; acc += x[i] * x[i]; }
  const rmsDb = db(Math.sqrt(acc / n));
  if (rmsDb < -50) { out.push("A gravação está quase sem som. Aproxime-se do microfone e grave de novo."); return out; }
  if (clip / n > 0.005) out.push("A gravação estourou (som muito alto). Afaste-se um pouco do microfone e grave de novo.");
  else if (rmsDb < -35) out.push("A voz ficou baixa. Aproxime-se do microfone (uns 15 a 20 cm).");

  // energia a cada 10 ms
  const f = Math.max(1, Math.round(rate * 0.01));
  const nf = Math.floor(n / f);
  const e: number[] = [];
  for (let i = 0; i < nf; i++) {
    let s = 0;
    for (let j = i * f; j < (i + 1) * f; j++) s += x[j] * x[j];
    e.push(db(Math.sqrt(s / f)));
  }
  const sorted = [...e].sort((a, b) => a - b);
  const mean = (a: number[]) => a.reduce((p, c) => p + c, 0) / Math.max(a.length, 1);
  const floor = mean(sorted.slice(0, Math.max(1, Math.floor(nf * 0.1))));
  const speech = mean(sorted.slice(Math.floor(nf * 0.7)));
  if (speech - floor < 15) out.push("O ambiente está barulhento (a voz quase não se destaca do ruído). Procure um lugar mais silencioso.");

  // tempo para a voz cair 20 dB depois de cada final de fala
  const thr = speech - 12;
  const times: number[] = [];
  for (let i = 3; i < nf - 1; i++) {
    if (e[i - 1] >= thr && e[i] < thr) {
      const l0 = Math.max(e[i - 3], e[i - 2], e[i - 1]);
      const stop = Math.max(l0 - 20, floor + 3);
      let j = i;
      while (j < nf && j - i < 60 && e[j] > stop) j++;
      if (j - i < 60 || e[j] <= stop) times.push((j - i) * 10);
    }
  }
  if (times.length >= 2) {
    times.sort((a, b) => a - b);
    const med = times[Math.floor(times.length / 2)];
    if (med > 280) out.push("Parece haver eco no ambiente: a voz demora a sumir entre as palavras. Grave perto de cortinas, sofá ou roupas penduradas (um armário aberto ajuda muito). A voz clonada copia o eco da gravação.");
  }
  return out;
}

// ---------- acabamento do áudio gerado ----------

// filtro passa-altas de 2ª ordem (Butterworth), tira roncos graves que "gastam" o volume
function highpass(x: Float32Array, rate: number, fc = 80): Float32Array {
  const w0 = (2 * Math.PI * fc) / rate, cos = Math.cos(w0), alpha = Math.sin(w0) / (2 * Math.SQRT1_2);
  const a0 = 1 + alpha;
  const b0 = ((1 + cos) / 2) / a0, b1 = -(1 + cos) / a0, b2 = b0, a1 = (-2 * cos) / a0, a2 = (1 - alpha) / a0;
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}

function wav16(pcm: Float32Array, rate: number): Blob {
  const i16 = new Int16Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) i16[i] = Math.max(-1, Math.min(1, pcm[i])) * 0x7fff;
  const h = new DataView(new ArrayBuffer(44));
  const w = (o: number, s: string) => [...s].forEach((c, i) => h.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); h.setUint32(4, 36 + i16.byteLength, true); w(8, "WAVE"); w(12, "fmt "); h.setUint32(16, 16, true);
  h.setUint16(20, 1, true); h.setUint16(22, 1, true); h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true);
  h.setUint16(32, 2, true); h.setUint16(34, 16, true); w(36, "data"); h.setUint32(40, i16.byteLength, true);
  return new Blob([h.buffer, i16.buffer], { type: "audio/wav" });
}

// Recebe o WAV gerado e devolve um WAV mono a 48 kHz com graves limpos e volume em -16 LUFS (limitador suave).
// Se qualquer coisa falhar, devolve o áudio original: o acabamento nunca pode impedir a geração.
export async function finishVoice(wav: Blob): Promise<Blob> {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC({ sampleRate: LOUD_RATE });
    let ch: Float32Array;
    try { ch = (await ctx.decodeAudioData(await wav.arrayBuffer())).getChannelData(0).slice(); }
    finally { await ctx.close(); }
    const clean = highpass(ch, LOUD_RATE);
    const m = measure([clean], LOUD_RATE);
    if (m.silent) return wav;
    const plan = planGain(m, VOICE_TARGET_LUFS, CEILING_DB);
    const [norm] = applyGain([clean], Math.min(plan.gainDb, 24), true, CEILING_DB);
    return wav16(norm, LOUD_RATE);
  } catch (e) {
    console.error("acabamento da voz:", e);
    return wav;
  }
}
