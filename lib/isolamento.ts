"use client";
// Modo "leve" (sem vários núcleos). A página inicial e a Minha voz são servidas "isoladas" (cabeçalhos COOP/COEP, ver
// next.config.ts) para o motor de voz usar vários núcleos. Se o motor de voz falhar assim (por exemplo, o navegador
// ou a hospedagem não aceitam o worker), o site recarrega a mesma página com ?leve=1, que NÃO recebe esses cabeçalhos
// e funciona como antes (1 núcleo, mais lento). A escolha fica guardada neste navegador.
const KEY = "sauim-sem-nucleos";

export const isLeve = () => typeof location !== "undefined" && new URLSearchParams(location.search).has("leve");
const flagged = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };

export function goLeve() {
  try { localStorage.setItem(KEY, "1"); } catch { /* segue */ }
  const u = new URL(location.href);
  u.searchParams.set("leve", "1");
  location.replace(u.toString());
}

// Chamar ao abrir a página: quem já teve falha vai direto para o modo leve. Devolve true se foi redirecionado.
export function maybeGoLeve(): boolean {
  if (typeof window !== "undefined" && window.crossOriginIsolated && flagged() && !isLeve()) { goLeve(); return true; }
  return false;
}

// Para tentar de novo vários núcleos (por exemplo, depois de um ajuste no site): limpa a escolha guardada.
export function clearLeve() { try { localStorage.removeItem(KEY); } catch { /* ignora */ } }
