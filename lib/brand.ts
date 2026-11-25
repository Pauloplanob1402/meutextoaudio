// Identidade Sauim: nome, slogan, etapas do fluxo e preços.
// Os números (quantas ferramentas há em cada etapa) são calculados a partir de lib/tools.ts,
// então o texto do site nunca fica diferente do que existe de verdade.
import { TOOLS, type GroupId } from "./tools";

export const BRAND = { name: "Sauim", domain: ".com.br", site: "sauim.com.br", tagline: "Comece pequeno. Cresça gigante." };

// Criador usa o mesmo preço configurado na cobrança (PRO_PRICE_BRL). Sem ele, mostra o preço de lançamento (R$ 39,90).
export const PRICE = {
  criador: Number(process.env.PRO_PRICE_BRL) > 0 ? Number(process.env.PRO_PRICE_BRL) : 39.9,
  estudio: 59.9,
};
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Plano anual do Criador. Por padrão: 10 meses pelo preço de 12 (2 meses grátis).
// Para outro valor, defina PRO_ANNUAL_PRICE_BRL (entra no site durante o build, como o preço mensal).
export const annualFor = (monthly: number) => Math.round(monthly * 10 * 100) / 100;
const annualEnv = Number(process.env.PRO_ANNUAL_PRICE_BRL);
const annualPrice = annualEnv > 0 ? annualEnv : annualFor(PRICE.criador);
const annualFull = Math.round(PRICE.criador * 12 * 100) / 100; // o que a pessoa pagaria em 12 meses no mensal
const annualSaving = Math.max(0, Math.round((annualFull - annualPrice) * 100) / 100);
const freeMonths = Math.round((annualSaving / PRICE.criador) * 10) / 10;
export const ANNUAL = {
  price: annualPrice,
  full: annualFull,
  saving: annualSaving,
  perMonth: Math.round((annualPrice / 12) * 100) / 100,
  extraPerMonth: Math.max(0, Math.round((PRICE.criador - annualPrice / 12) * 100) / 100), // quanto o mensal custa a mais, por mês
  freeMonths,
  freeLabel: freeMonths >= 1 ? `${String(freeMonths).replace(".", ",")} ${freeMonths === 1 ? "mês" : "meses"} grátis` : null,
  percent: annualFull > 0 ? Math.round((annualSaving / annualFull) * 100) : 0,
};

export const GROUP_LABEL: Record<GroupId, string> = {
  ideias: "Ideias",
  roteiro: "Roteiro e Áudio",
  publicar: "Publicar",
  imagem: "Imagem",
  planejar: "Planejar",
};

export type Stage = { id: string; n: string; tag: string; kicker: string; title: string; text: string; unit: string; groups: GroupId[] };

export const STAGES: Stage[] = [
  { id: "feito", n: "01", tag: "Feito", kicker: "Criação pronta", title: "Roteiro, áudio e capa", unit: "ferramentas de criação", groups: ["ideias", "roteiro", "imagem"],
    text: "Ideias, roteiro cronometrado, narração em MP3 ou WAV e miniatura, tudo pronto antes de abrir o YouTube Studio." },
  { id: "subiu", n: "02", tag: "Subiu", kicker: "Upload otimizado", title: "SEO, capítulos e legendas", unit: "ferramentas de publicação", groups: ["publicar"],
    text: "Títulos, tags, capítulos, legendas e checklist de lançamento, conferidos antes de publicar." },
  { id: "postado", n: "03", tag: "Postado", kicker: "No ar para o público", title: "Planejamento e ritmo", unit: "ferramentas estratégicas", groups: ["planejar"],
    text: "Com o vídeo no ar, mantenha o ritmo com calendário editorial, DNA de marca e projeção de ganhos." },
];

// a ferramenta principal (Texto em Áudio) conta na etapa "Feito"
export const stageCount = (s: Stage) => TOOLS.filter((t) => s.groups.includes(t.group)).length + (s.id === "feito" ? 1 : 0);
export const EXTRAS = TOOLS.length; // ferramentas extras (fora o Texto em Áudio)
export const TOTAL = TOOLS.length + 1;
