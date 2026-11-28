import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Cabeçalhos de segurança
// O CSP (que sites e arquivos o navegador pode carregar) começa em modo "só relatório":
// nada é bloqueado, só aparece em /api/csp-report e no log da Vercel.
// Para LIGAR de verdade: crie a variável CSP_MODE=enforce na Vercel e publique de novo.
// ---------------------------------------------------------------------------
const isProd = process.env.NODE_ENV === "production";
const selfHost = process.env.NEXT_PUBLIC_SELF_HOST === "1";
const enforce = process.env.CSP_MODE === "enforce";
const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? ["https://challenges.cloudflare.com"] : []; // anti-robô do login (opcional)

let supabaseHost = "https://*.supabase.co";
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
} catch { /* mantém o padrão */ }
const supabaseWs = supabaseHost.replace(/^https:/, "wss:");

// A voz (Piper) baixa o motor do cdnjs/jsDelivr e a voz do Hugging Face, a menos que você use `npm run self-host`.
// A ferramenta "Minha voz (beta)" sempre baixa o motor (jsDelivr) e o modelo (Hugging Face), mesmo com a hospedagem própria ligada.
const voiceCdn = selfHost ? ["https://cdn.jsdelivr.net"] : ["https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"];
const voiceData = ["https://huggingface.co", "https://*.huggingface.co", "https://*.hf.co"];

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' é necessário para o Next.js (scripts de hidratação) sem trocar o site para renderização dinâmica.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isProd ? "" : " 'unsafe-eval'"} ${[...voiceCdn, ...turnstile].join(" ")}`.trim(),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob: data:",
  `connect-src 'self' ${supabaseHost} ${supabaseWs} ${[...voiceCdn, ...voiceData, ...turnstile].join(" ")}`.trim(),
  ...(turnstile.length ? [`frame-src ${turnstile.join(" ")}`] : []),
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // só vale (e só é aceito sem aviso) quando o CSP está ligado de verdade
  ...(isProd && enforce ? ["upgrade-insecure-requests"] : []),
  "report-uri /api/csp-report",
].join("; ");

const securityHeaders = [
  { key: enforce ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", value: csp },
  // HTTPS obrigatório. Começa com 30 dias e sem subdomínios: é difícil desfazer, então aumente com calma.
  { key: "Strict-Transport-Security", value: "max-age=2592000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // fullscreen=(self): o teleprompter usa tela cheia. O resto do que o site não usa fica desligado.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=(), usb=(), fullscreen=(self)" },
];

// O Piper (WebAssembly) tem um trecho de código para Node que usa fs e path.
// No navegador ele nunca roda, então trocamos por um arquivo vazio.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // o calendário semanal virou calendário do mês: o endereço antigo continua funcionando
  async redirects() {
    return [
      // um endereço só: o login é guardado por endereço, então sauim.com.br e www.sauim.com.br não podem conviver
      { source: "/:path*", has: [{ type: "host", value: "sauim.com.br" }], destination: "https://www.sauim.com.br/:path*", permanent: false },
      { source: "/ferramentas/calendario-semanal", destination: "/ferramentas/calendario", permanent: true },
      // o cruzador de nicho foi trocado pelo gerador de títulos
      { source: "/ferramentas/cruzador-de-nicho", destination: "/ferramentas/gerador-de-titulos", permanent: true },
    ];
  },
  turbopack: {
    resolveAlias: {
      fs: { browser: "./empty.ts" },
      path: { browser: "./empty.ts" },
    },
  },
};

export default nextConfig;
