"use client";
// Motor da voz clonada para o Texto em áudio (mesmo Pocket TTS da ferramenta "Minha voz").
// O modelo e a voz ficam carregados enquanto a página estiver aberta: depois da primeira vez,
// gerar de novo não baixa nem prepara nada.
import type { PocketTTS } from "@/lib/pocketTts";
import { splitText } from "@/lib/tts";
import type { SavedRef } from "@/lib/minhaVoz";

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

export function resetClone() {
  tts?.destroy(); tts = null; loading = null; voiceRef = null; voiceSig = "";
}

export async function openCloneSession(ref: SavedRef, onStatus: (s: string) => void): Promise<{ predict: (text: string) => Promise<Blob> }> {
  const lib = await import("@/lib/pocketTts");
  if (!tts) {
    loading ??= (async () => {
      const t = new lib.PocketTTS({ language: QUALITY, quantized: true, voiceCloning: true });
      await t.load((p: { total?: number; loaded?: number; label?: string; fromCache?: boolean; status?: string }) => {
        if (p.total) onStatus(`Baixando ${p.label ?? "o modelo da sua voz"}: ${Math.round(((p.loaded ?? 0) * 100) / p.total)}%${p.fromCache ? " (já estava salvo)" : ""}`);
        else if (p.status) onStatus("Preparando o motor da sua voz…");
      });
      return t;
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
      for (const piece of splitText(text, 250)) {
        const m = await t.generate(piece, { voice, onChunk: (a: Float32Array) => { chunks.push(new Float32Array(a)); } });
        if (m.stopped) break;
      }
      if (!chunks.length) throw new Error("sem áudio");
      return lib.chunksToWavBlob(chunks, t.sampleRate) as Blob;
    },
  };
}
