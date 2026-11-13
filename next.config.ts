import type { NextConfig } from "next";

// O Piper (WebAssembly) tem um trecho de código para Node que usa fs e path.
// No navegador ele nunca roda, então trocamos por um arquivo vazio.
const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: { browser: "./empty.ts" },
      path: { browser: "./empty.ts" },
    },
  },
};

export default nextConfig;
