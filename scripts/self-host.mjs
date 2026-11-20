// Copia/baixa para a pasta public/ tudo o que a voz precisa, para o site
// não depender de Hugging Face, cdnjs ou jsDelivr.
// Uso: npm run self-host   (precisa de internet; roda uma vez)
import { copyFileSync, mkdirSync, readdirSync, createWriteStream, existsSync } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";

const HF = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main";
const OFFICIAL = "https://huggingface.co/rhasspy/piper-voices/resolve/main";
// mantenha igual à lista de lib/voices.ts. "official" = voz que não está no espelho diffusionstudio.
const VOICES = [
  { path: "pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx" },
  { path: "pt/pt_BR/cadu/medium/pt_BR-cadu-medium.onnx", official: true },
  { path: "pt/pt_BR/jeff/medium/pt_BR-jeff-medium.onnx", official: true },
  { path: "pt/pt_BR/edresson/low/pt_BR-edresson-low.onnx" },
  { path: "pt/pt_PT/tugão/medium/pt_PT-tugão-medium.onnx" },
];

// 1) Motor de pronúncia (vem do pacote instalado)
mkdirSync("public/piper", { recursive: true });
for (const f of ["piper_phonemize.wasm", "piper_phonemize.data"]) {
  copyFileSync(join("node_modules/@diffusionstudio/piper-wasm/build", f), join("public/piper", f));
}
console.log("OK  public/piper");

// 2) Motor de inferência (arquivos .wasm do onnxruntime-web, sem as versões WebGPU)
mkdirSync("public/ort", { recursive: true });
const dist = "node_modules/onnxruntime-web/dist";
for (const f of readdirSync(dist)) {
  if (/^ort-wasm.*\.wasm$/.test(f) && !f.includes("jsep")) copyFileSync(join(dist, f), join("public/ort", f));
}
console.log("OK  public/ort");

// 3) As vozes (uns 60 MB cada)
for (const { path: vp, official } of VOICES) for (const path of [vp, vp + ".json"]) {
  const out = join("public/voices", path);
  mkdirSync(join(out, ".."), { recursive: true });
  if (existsSync(out)) { console.log("já existe", out); continue; }
  const res = await fetch(`${official ? OFFICIAL : HF}/${path}`);
  if (!res.ok) throw new Error(`Falha ao baixar ${path}: HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(out));
  console.log("OK ", out);
}
console.log("\nPronto. Agora defina NEXT_PUBLIC_SELF_HOST=1 (veja o README) e publique a pasta public/.");
