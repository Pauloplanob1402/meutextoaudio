// Hospedagem própria dos arquivos de voz (opcional).
// Ligue com NEXT_PUBLIC_SELF_HOST=1 depois de rodar `npm run self-host`.
import { VOICES } from "@/lib/voices";

export const SELF_HOST = process.env.NEXT_PUBLIC_SELF_HOST === "1";

const HF = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main/";

export const wasmPaths = SELF_HOST
  ? {
      onnxWasm: "/ort/",
      piperData: "/piper/piper_phonemize.data",
      piperWasm: "/piper/piper_phonemize.wasm",
    }
  : undefined;

// Repositório oficial do Piper: usado só para as vozes que a biblioteca ainda não conhece (Cadu e Jeff).
const OFFICIAL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/";

// A biblioteca baixa a voz de um endereço fixo do Hugging Face. Aqui:
// - registramos as vozes extras na lista dela;
// - com a hospedagem própria ligada, redirecionamos o endereço para a pasta /voices do site;
// - sem ela, mandamos as vozes extras para o repositório oficial.
export function redirectVoiceDownloads(map?: Record<string, string>) {
  if (typeof window === "undefined") return;
  if (map) for (const v of VOICES) if (v.official && v.path) map[v.id] = v.path;
  const w = window as any;
  if (w.__voiceRedirect) return;
  const extra = VOICES.filter((v) => v.official && v.path).map((v) => v.path!.slice(0, v.path!.lastIndexOf("/") + 1));
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(HF)) {
      const path = url.slice(HF.length);
      if (SELF_HOST) return original("/voices/" + path, init);
      if (extra.some((e) => path.startsWith(e))) return original(OFFICIAL + path, init);
    }
    return original(input, init);
  };
  w.__voiceRedirect = true;
}
