import type { NextConfig } from "next";

// O Piper (WebAssembly) tem um trecho de código para Node que usa fs e path.
// No navegador ele nunca roda, então trocamos por um arquivo vazio.
const nextConfig: NextConfig = {
  // o calendário semanal virou calendário do mês: o endereço antigo continua funcionando
  async redirects() {
    return [
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
