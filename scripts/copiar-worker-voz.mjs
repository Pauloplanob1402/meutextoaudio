// Copia o motor da voz clonada (worker) de lib/pocketTts/ para public/pocket-tts/.
// Por quê: o Next/Turbopack montava esse worker com um carregador próprio (importScripts de arquivos em /_next/static),
// que falhou no site publicado ("Worker error"). Servido como arquivo simples de public/, o navegador carrega direto.
// Roda sozinho antes do `npm run dev` e do `npm run build` (veja "predev" e "prebuild" no package.json).
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/pocket-tts", { recursive: true });
for (const f of ["worker.js", "tokenizer.js", "binary.js"]) copyFileSync(`lib/pocketTts/${f}`, `public/pocket-tts/${f}`);
console.log("Motor da voz copiado para public/pocket-tts/");
