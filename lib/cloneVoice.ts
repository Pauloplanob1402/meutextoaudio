// Minha voz (beta): gravação de referência guardada no aparelho + motor de voz clonada (Pocket TTS, no navegador).
// Um único motor é compartilhado entre a ferramenta "Minha voz" e o Texto em áudio, e só uma geração roda por vez.
import type { PocketTTS } from "@/lib/pocketTts";
import type { VoiceInfo } from "@/lib/voices";

export const CLONE_ID = "minha-voz";
export const CLONE_INFO: VoiceInfo = { id: CLONE_ID, name: "Minha voz", lang: "pt-BR", note: "Beta, só no computador", engine: "clone", plan: "pro" };
export const MAX_REF = 10; // segundos de referência
export const QUALITY = [
  { id: "portuguese", label: "Rápida", hint: "Menor e mais rápida." },
  { id: "portuguese_24l", label: "Melhor qualidade", hint: "Mais camadas: soa melhor, mas baixa mais e é mais lenta." },
];

const STORE = "minha-voz-ref";
const QSTORE = "minha-voz-qualidade";

export type Ref = { samples: Float32Array; rate: number; seconds: number; warn: string; stamp: string };

export function toRef(ch: Float32Array, rate: number, stamp = String(Date.now())): Ref {
  // tira o silêncio do começo e do fim e deixa o volume num nível bom: a voz clonada copia tudo o que ouve na referência
  let lo = 0, hi = ch.length;
  const thr = 0.02;
  while (lo < hi && Math.abs(ch[lo]) < thr) lo++;
  while (hi > lo && Math.abs(ch[hi - 1]) < thr) hi--;
  const pad = Math.round(0.1 * rate);
  lo = Math.max(0, lo - pad); hi = Math.min(ch.length, hi + pad);
  if (hi - lo < rate) { lo = 0; hi = ch.length; } // quase nada acima do limite: não corta
  const n = Math.min(hi - lo, Math.round(MAX_REF * rate));
  const samples = ch.slice(lo, lo + n);
  let peak = 0, acc = 0;
  for (let i = 0; i < n; i++) { const a = Math.abs(samples[i]); if (a > peak) peak = a; acc += samples[i] * samples[i]; }
  const rmsDb = 20 * Math.log10(Math.sqrt(acc / Math.max(n, 1)) || 1e-9);
  let warn = "";
  if (n / rate < 3) warn = "A gravação ficou muito curta. Use de 5 a 10 segundos.";
  else if (rmsDb < -50) warn = "A gravação está quase sem som. Aproxime-se do microfone e grave de novo.";
  else if (peak > 0.99) warn = "A gravação estourou (som muito alto). Afaste-se um pouco do microfone e grave de novo.";
  if (!warn && peak > 0.05) { const g = 0.89 / peak; for (let i = 0; i < n; i++) samples[i] *= g; } // pico em cerca de -1 dB
  return { samples, rate, seconds: n / rate, warn, stamp };
}

export function saveRef(r: Ref) {
  try {
    const i16 = new Int16Array(r.samples.length);
    for (let i = 0; i < i16.length; i++) i16[i] = Math.max(-1, Math.min(1, r.samples[i])) * 0x7fff;
    let bin = "";
    const u8 = new Uint8Array(i16.buffer);
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
    localStorage.setItem(STORE, JSON.stringify({ rate: r.rate, stamp: r.stamp, data: btoa(bin) }));
  } catch { /* sem espaço ou bloqueado: segue sem guardar */ }
}
export function restoreRef(): Ref | null {
  try {
    const j = JSON.parse(localStorage.getItem(STORE) || "null");
    if (!j?.data) return null;
    const bin = atob(j.data);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const i16 = new Int16Array(u8.buffer);
    const f = new Float32Array(i16.length);
    for (let i = 0; i < f.length; i++) f[i] = i16[i] / 0x7fff;
    return toRef(f, j.rate, j.stamp || "0");
  } catch { return null; }
}
export function hasRef(): boolean { try { return !!localStorage.getItem(STORE); } catch { return false; } }
export function clearRef() { try { localStorage.removeItem(STORE); } catch {} }
export function getQuality(): string {
  try { const q = localStorage.getItem(QSTORE); if (q && QUALITY.some((x) => x.id === q)) return q; } catch {}
  return QUALITY[0].id;
}
export function setQuality(q: string) { try { localStorage.setItem(QSTORE, q); } catch {} }

// ----- motor -----
type Engine = { tts: PocketTTS; quality: string; voices: Map<string, string>; queue: Promise<unknown>; stopped: boolean };
let engine: Engine | null = null;
let loading: Promise<Engine> | null = null;

export type CloneHandle = {
  sampleRate: number;
  begin(): void; // começa um trabalho novo (zera o "parar")
  isStopped(): boolean;
  stop(): void;
  generate(text: string, onChunk: (a: Float32Array) => void): Promise<{ genTime: number; audioDuration: number }>;
};

async function getEngine(quality: string, onStatus: (m: string) => void): Promise<Engine> {
  if (engine && engine.quality === quality) return engine;
  if (loading) { await loading.catch(() => {}); if (engine && engine.quality === quality) return engine; }
  loading = (async () => {
    engine?.tts.destroy(); engine = null;
    const { PocketTTS } = await import("@/lib/pocketTts");
    const t = new PocketTTS({ language: quality, quantized: true, voiceCloning: true });
    await t.load((p) => {
      if (p.total) onStatus(`Baixando ${p.label ?? "o modelo"}: ${Math.round(((p.loaded ?? 0) * 100) / p.total)}%${p.fromCache ? " (já estava salvo)" : ""}`);
      else if (p.status) onStatus(p.status);
    });
    engine = { tts: t, quality, voices: new Map(), queue: Promise.resolve(), stopped: false };
    return engine;
  })();
  try { return await loading; } finally { loading = null; }
}

export async function prepareClone(ref: Ref, quality: string, onStatus: (m: string) => void): Promise<CloneHandle> {
  let e: Engine;
  try {
    e = await getEngine(quality, onStatus);
    if (!e.voices.has(ref.stamp)) {
      onStatus("Aprendendo a sua voz…");
      const v = await e.tts.cloneVoice(ref.samples, { inputSampleRate: ref.rate, name: `minha-voz-${ref.stamp}` });
      e.voices.set(ref.stamp, v);
    }
  } catch (err) {
    engine?.tts.destroy(); engine = null; // recomeça limpo na próxima vez
    throw err;
  }
  const eng = e;
  const voice = eng.voices.get(ref.stamp)!;
  return {
    sampleRate: eng.tts.sampleRate,
    begin() { eng.stopped = false; },
    isStopped() { return eng.stopped; },
    stop() { eng.stopped = true; eng.tts.stop().catch(() => {}); },
    generate(text, onChunk) {
      // uma geração por vez: o motor guarda um único "receptor" de áudio, e duas ao mesmo tempo misturariam as vozes
      const run = eng.queue.then(async () => {
        if (eng.stopped) return { genTime: 0, audioDuration: 0 };
        const m = await eng.tts.generate(text, { voice, onChunk: (a) => onChunk(new Float32Array(a)) });
        return { genTime: m.genTime, audioDuration: m.audioDuration };
      });
      eng.queue = run.catch(() => {});
      return run;
    },
  };
}

// Para o Texto em áudio: devolve algo com `predict(texto) -> WAV`, como as outras vozes.
export async function createCloneSession(onStatus: (m: string) => void): Promise<{ predict: (t: string) => Promise<Blob> }> {
  const ref = restoreRef();
  if (!ref) throw new Error("sem-gravacao");
  const h = await prepareClone(ref, getQuality(), onStatus);
  h.begin();
  return {
    predict: async (text: string) => {
      const chunks: Float32Array[] = [];
      // a voz clonada piora em trechos longos: o Texto em áudio manda até 500 letras, aqui quebramos em até 250 (como na ferramenta Minha voz)
      const { splitText } = await import("@/lib/tts");
      for (const piece of splitText(text, 250)) {
        if (h.isStopped()) break;
        await h.generate(piece, (a) => chunks.push(a));
      }
      if (!chunks.length) throw new Error("vazio");
      const { chunksToWavBlob } = await import("@/lib/pocketTts");
      return chunksToWavBlob(chunks, h.sampleRate) as Blob;
    },
  };
}
