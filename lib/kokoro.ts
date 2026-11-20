// Voz natural (Kokoro-82M) em português do Brasil, rodando no navegador.
//
// Como funciona, em 3 passos:
// 1) o texto vira sons (fonemas) com o mesmo motor de pronúncia que o Piper já usa;
// 2) os sons viram números pela tabela do modelo (lib/kokoroVocab.ts);
// 3) o modelo (onnxruntime-web, o mesmo do Piper) gera o áudio.
//
// O modelo é um só e fica salvo no navegador. Trocar entre Dora, Alex e Santa só troca um arquivo
// pequeno de "estilo da voz" (uns 500 KB).
import { KOKORO_VOCAB } from "@/lib/kokoroVocab";

const HF = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main";
export const KOKORO_MODEL_URL = `${HF}/onnx/model_quantized.onnx`;
export const kokoroStyleUrl = (voice: string) => `${HF}/voices/${voice}.bin`;

const SAMPLE_RATE = 24000;
const MAX_TOKENS = 500; // o modelo aceita até 510; deixo folga
const GAP_SECONDS = 0.1; // silêncio entre os pedaços de um mesmo trecho
const CACHE_NAME = "saium-kokoro-v1";

type Progress = (loaded: number, total: number) => void;

export type PiperBits = {
  // endereços do motor de pronúncia e do onnxruntime (o app decide: CDN ou hospedagem própria)
  piperWasm: string;
  piperData: string;
  onnxWasm: string;
};

// ---------- download com cache e barra de progresso ----------

async function fetchCached(url: string, onProgress?: Progress): Promise<ArrayBuffer> {
  let cache: Cache | null = null;
  try {
    cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(url);
    if (hit) return await hit.arrayBuffer();
  } catch {
    cache = null;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  const total = Number(res.headers.get("content-length")) || 0;
  let buf: ArrayBuffer;
  if (res.body && onProgress && total) {
    const reader = res.body.getReader();
    const parts: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      loaded += value.length;
      onProgress(loaded, total);
    }
    const all = new Uint8Array(loaded);
    let o = 0;
    for (const p of parts) { all.set(p, o); o += p.length; }
    buf = all.buffer;
  } else {
    buf = await res.arrayBuffer();
  }
  try { await cache?.put(url, new Response(buf.slice(0))); } catch { /* sem cache, tudo bem */ }
  return buf;
}

// ---------- texto -> sons ----------

// O motor de pronúncia do Piper devolve os sons do espeak-ng, os mesmos que o Kokoro usa no treino.
async function phonemize(text: string, bits: PiperBits): Promise<string> {
  const mod: any = await import("@diffusionstudio/piper-wasm/build/piper_phonemize.js");
  const create = mod.default ?? mod;
  let out = "";
  const m = await create({
    print: (line: string) => {
      try { out += ((JSON.parse(line).phonemes as string[]) ?? []).join("") + " "; } catch { /* linha que não é dado */ }
    },
    printErr: () => {},
    locateFile: (u: string) => (u.endsWith(".wasm") ? bits.piperWasm : u.endsWith(".data") ? bits.piperData : u),
  });
  m.callMain(["-l", "pt-br", "--input", JSON.stringify([{ text: text.trim() }]), "--espeak_data", "/espeak-ng-data"]);
  return out
    .replace(/([.!?…])(?=[^\s.!?…"'»)])/g, "$1 ") // o motor cola as frases; o Kokoro espera um espaço
    .split("")
    .filter((c) => c in KOKORO_VOCAB)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

// Quebra em pedaços curtos, nas frases e, se preciso, nas vírgulas e nas palavras.
export function splitForKokoro(text: string, max = 220): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const sentences = t.match(/[^.!?…]+[.!?…]*/g) ?? [t];
  const out: string[] = [];
  let cur = "";
  const push = () => { if (cur.trim()) out.push(cur.trim()); cur = ""; };
  const addPiece = (s: string) => {
    if ((cur + " " + s).trim().length > max) push();
    cur = (cur + " " + s).trim();
  };
  for (const s of sentences) {
    if (s.length <= max) { addPiece(s); continue; }
    for (const c of s.match(/[^,;:]+[,;:]*/g) ?? [s]) {
      if (c.length <= max) { addPiece(c); continue; }
      let w = "";
      for (const word of c.split(" ")) {
        if ((w + " " + word).trim().length > max) { addPiece(w); w = word; } else w = (w + " " + word).trim();
      }
      if (w) addPiece(w);
    }
  }
  push();
  return out;
}

// ---------- áudio ----------

export function floatToWav(pcm: Float32Array, rate = SAMPLE_RATE): Blob {
  const data = new Int16Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const head = new ArrayBuffer(44);
  const v = new DataView(head);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + data.byteLength, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, data.byteLength, true);
  return new Blob([head, data.buffer], { type: "audio/wav" });
}

// ---------- sessão ----------

export type KokoroSession = { predict: (text: string) => Promise<Blob> };

// O modelo é grande: carregamos uma vez e reaproveitamos para as três vozes.
let shared: { ort: any; session: any; inputName: string; outputName: string } | null = null;
const styles = new Map<string, Float32Array>();

export async function createKokoro(opts: {
  voice: string; // "pf_dora", "pm_alex" ou "pm_santa"
  bits: PiperBits;
  onProgress?: Progress;
}): Promise<KokoroSession> {
  const { voice, bits, onProgress } = opts;

  if (!shared) {
    const mod: any = await import("onnxruntime-web/wasm");
    const ort = mod.default || mod;
    if (ort.env?.wasm) ort.env.wasm.wasmPaths = bits.onnxWasm;
    const model = await fetchCached(KOKORO_MODEL_URL, onProgress);
    const session = await ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
    const names: string[] = session.inputNames;
    shared = {
      ort,
      session,
      inputName: names.find((n) => n !== "style" && n !== "speed") ?? names[0],
      outputName: session.outputNames[0],
    };
  }

  if (!styles.has(voice)) {
    styles.set(voice, new Float32Array(await fetchCached(kokoroStyleUrl(voice))));
  }
  const style = styles.get(voice)!;
  const { ort, session, inputName, outputName } = shared;

  async function synth(piece: string, depth = 0): Promise<Float32Array[]> {
    const ph = await phonemize(piece, bits);
    const ids = [...ph].map((c) => KOKORO_VOCAB[c]);
    if (!ids.length) return [];
    if (ids.length > MAX_TOKENS) {
      if (depth > 4) return [];
      const parts = splitForKokoro(piece, Math.max(40, Math.floor(piece.length / 2)));
      if (parts.length < 2) return [];
      const outs: Float32Array[] = [];
      for (const p of parts) outs.push(...(await synth(p, depth + 1)));
      return outs;
    }
    const tokens = new BigInt64Array(ids.length + 2);
    ids.forEach((id, i) => (tokens[i + 1] = BigInt(id)));
    const at = 256 * Math.min(ids.length, 509);
    const feeds = {
      [inputName]: new ort.Tensor("int64", tokens, [1, tokens.length]),
      style: new ort.Tensor("float32", style.slice(at, at + 256), [1, 256]),
      speed: new ort.Tensor("float32", [1], [1]),
    };
    const result = await session.run(feeds);
    return [new Float32Array(result[outputName].data as Float32Array)];
  }

  return {
    async predict(text: string) {
      const chunks: Float32Array[] = [];
      for (const piece of splitForKokoro(text)) {
        const got = await synth(piece);
        if (chunks.length && got.length) chunks.push(new Float32Array(Math.round(GAP_SECONDS * SAMPLE_RATE)));
        chunks.push(...got);
        await new Promise((r) => setTimeout(r, 0)); // deixa a tela respirar
      }
      if (!chunks.length) throw new Error("nenhum som gerado");
      const total = chunks.reduce((n, c) => n + c.length, 0);
      const merged = new Float32Array(total);
      let o = 0;
      for (const c of chunks) { merged.set(c, o); o += c.length; }
      return floatToWav(merged);
    },
  };
}
