// Hospedagem própria dos arquivos de voz (opcional).
// Ligue com NEXT_PUBLIC_SELF_HOST=1 depois de rodar `npm run self-host`.
export const SELF_HOST = process.env.NEXT_PUBLIC_SELF_HOST === "1";

const HF = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main/";

export const wasmPaths = SELF_HOST
  ? {
      onnxWasm: "/ort/",
      piperData: "/piper/piper_phonemize.data",
      piperWasm: "/piper/piper_phonemize.wasm",
    }
  : undefined;

// A biblioteca baixa a voz de um endereço fixo do Hugging Face.
// Aqui redirecionamos esse endereço para a pasta /voices do próprio site.
export function redirectVoiceDownloads() {
  if (!SELF_HOST || typeof window === "undefined") return;
  const w = window as any;
  if (w.__voiceRedirect) return;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(HF)) return original("/voices/" + url.slice(HF.length), init);
    return original(input, init);
  };
  w.__voiceRedirect = true;
}
