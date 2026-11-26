// Protótipo da Legenda automática: o reconhecimento de voz roda aqui, fora da tela, para o site não travar.
import { env, pipeline } from "@huggingface/transformers";

env.allowLocalModels = false; // sempre busca o modelo no Hugging Face (e guarda no navegador)
env.useBrowserCache = true;

type RunMsg = { type: "run"; model: string; device: "auto" | "wasm"; language: string; audio: Float32Array; seconds: number };
type Asr = (audio: Float32Array, opts: Record<string, unknown>) => Promise<{ text: string; chunks?: { text: string; timestamp: [number, number | null] }[] }>;
type MakeAsr = (task: string, model: string, opts: Record<string, unknown>) => Promise<Asr>;

const ctx = self as unknown as { postMessage(m: unknown): void; onmessage: ((e: MessageEvent<RunMsg>) => void) | null };
const post = (m: unknown) => ctx.postMessage(m);
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

ctx.onmessage = async (e) => {
  if (e.data.type !== "run") return;
  const { model, device, language, audio, seconds } = e.data;
  try {
    const hasGpu = typeof navigator !== "undefined" && "gpu" in navigator;
    let used: "webgpu" | "wasm" = device === "auto" && hasGpu ? "webgpu" : "wasm";
    let fallback = "";
    const make = (d: "webgpu" | "wasm") =>
      (pipeline as unknown as MakeAsr)("automatic-speech-recognition", model, {
        device: d,
        // mesmas escolhas do exemplo oficial de reconhecimento de voz em tempo real do Hugging Face
        dtype: d === "webgpu" ? { encoder_model: "fp32", decoder_model_merged: "fp32" } : { encoder_model: "fp32", decoder_model_merged: "q8" },
        progress_callback: (p: unknown) => post({ type: "load", p }),
      });

    const t0 = performance.now();
    let asr: Asr;
    try {
      asr = await make(used);
    } catch (err) {
      if (used !== "webgpu") throw err;
      fallback = `A placa de vídeo (WebGPU) falhou e foi usado o processador: ${msg(err)}`;
      used = "wasm";
      asr = await make("wasm");
    }
    const loadMs = performance.now() - t0;
    post({ type: "loaded", used, loadMs, fallback });

    const t1 = performance.now();
    let chunks = 0;
    const out = await asr(audio, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: language === "auto" ? undefined : language,
      task: "transcribe",
      return_timestamps: true,
      chunk_callback: () => {
        chunks++;
        post({ type: "chunk", chunks });
      },
    });
    post({ type: "done", out, runMs: performance.now() - t1, used, fallback, loadMs, seconds });
  } catch (err) {
    post({ type: "error", message: msg(err) });
  }
};
