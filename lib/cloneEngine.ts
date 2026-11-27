"use client";
// Motor da voz clonada para o Texto em áudio (mesmo Pocket TTS da ferramenta "Minha voz").
// O modelo e a voz ficam carregados enquanto a página estiver aberta: depois da primeira vez,
// gerar de novo não baixa nem prepara nada.
import type { PocketTTS } from "@/lib/pocketTts";
import { splitText } from "@/lib/tts";
import type { SavedRef } from "@/lib/minhaVoz";
import { finishVoice } from "@/lib/voiceFinish";

// Ajustes de qualidade (mexa aqui): mais passos = voz mais limpa e mais lenta; temperatura menor = mais estável.
export const LSD_STEPS = 2;
export const TEMPERATURE = 0.55;
const CHUNK_CHARS = 180; // frases de uns 80 a 180 caracteres saem melhores que trechos enormes
const QUALITY = "portuguese"; // a versão rápida; a de 24 camadas fica só na ferramenta Minha voz
let tts: PocketTTS | null = null;
let loading: Promise<PocketTTS> | null = null;
let voiceRef: string | null = null;
let voiceSig = "";

// assinatura barata da gravação, só para saber se a voz mudou
const sig = (r: SavedRef) => `${r.rate}:${r.samples.length}:${[0, 0.25, 0.5, 0.75].map((f) => r.samples[Math.floor(f * (r.samples.length - 1))]?.toFixed(5)).join(",")}`;

export function isolated(): boolean {
  return typeof window !== "undefined" && window.crossOriginIsolated === true;
}

// Carrega o motor. Se falhar com vários núcleos (página isolada), tenta de novo com 1 núcleo: mais lento, mas funciona.
type Progress = (p: { total?: number; loaded?: number; label?: string; fromCache?: boolean; status?: string }) => void;
export async function loadPocket(lib: typeof import("@/lib/pocketTts"), language: string, onProgress: Progress): Promise<PocketTTS> {
  const make = (maxThreads?: number) => new lib.PocketTTS({ language, quantized: true, voiceCloning: true, lsdSteps: LSD_STEPS, temperature: TEMPERATURE, ...(maxThreads ? { maxThreads } : {}) });
  let t = make();
  try { await t.load(onProgress); return t; }
  catch (e) {
    t.destroy();
    if (!isolated()) throw e;
    console.warn("Falhou com vários núcleos; tentando com 1:", e);
    t = make(1);
    await t.load(onProgress);
    return t;
  }
}

// texto curto do erro para mostrar na tela (ajuda a achar o problema)
export const errText = (e: unknown) => String((e as { message?: string })?.message ?? e).slice(0, 200);

export function resetClone() {
  tts?.destroy(); tts = null; loading = null; voiceRef = null; voiceSig = "";
}

export async function openCloneSession(ref: SavedRef, onStatus: (s: string) => void): Promise<{ predict: (text: string) => Promise<Blob> }> {
  const lib = await import("@/lib/pocketTts");
  if (!tts) {
    loading ??= (async () => {
      return loadPocket(lib, QUALITY, (p) => {
        if (p.total) onStatus(`Baixando ${p.label ?? "o modelo da sua voz"}: ${Math.round(((p.loaded ?? 0) * 100) / p.total)}%${p.fromCache ? " (já estava salvo)" : ""}`);
        else if (p.status) onStatus("Preparando o motor da sua voz…");
      });
    })();
    try { tts = await loading; } catch (e) { loading = null; throw e; }
  }
  const t = tts;
  const s = sig(ref);
  if (!voiceRef || voiceSig !== s) {
    onStatus("Aprendendo a sua voz…");
    voiceRef = await t.cloneVoice(ref.samples, { inputSampleRate: ref.rate, name: "minha-voz" });
    voiceSig = s;
  }
  const voice = voiceRef;
  return {
    async predict(text: string) {
      const chunks: Float32Array[] = [];
      for (const piece of splitText(text, CHUNK_CHARS)) {
        const m = await t.generate(piece, { voice, onChunk: (a: Float32Array) => { chunks.push(new Float32Array(a)); } });
        if (m.stopped) break;
      }
      if (!chunks.length) throw new Error("sem áudio");
      return finishVoice(lib.chunksToWavBlob(chunks, t.sampleRate) as Blob); // graves limpos + volume em -16 LUFS
    },
  };
}
