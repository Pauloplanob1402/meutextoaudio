// Dados legais do site, usados nas páginas /privacidade e /termos.
// 1) Se algum campo voltar a ter [PREENCHER ...], as duas páginas mostram um aviso para você.
// 2) Ajuste os "recursos" mais abaixo para o que o site faz de verdade hoje.
import { VOICES } from "@/lib/voices";

export const LEGAL = {
  // Por enquanto o site não divulga CNPJ/CPF, endereço nem os nomes dos fundadores (decisão da equipe).
  // Quando quiser divulgar, acrescente aqui "documento" e "endereco" e ajuste o bloco <Historia> em components/Legal.tsx.
  nome: "a equipe do Sauim",
  email: "contato@sauim.com.br",
  hospedagem: "Vercel",
  envioEmail: "Brevo",
  encaminhamento: "ImprovMX",
};

// Ligue (true) ou desligue (false) conforme o que o site faz de fato.
// Se o texto de uma página disser algo que o site não faz, ou deixar de dizer algo que ele faz, a página fica errada.
export const RECURSOS = {
  loginGoogle: true, // há o botão "Continuar com o Google" (além de e-mail e senha, e link por e-mail)
  historicoNaNuvem: false, // true quando o plano Criador puder salvar textos no servidor (ainda não existe)
};

// Vem do mesmo ajuste usado em lib/selfhost.ts: se a voz é servida pelo próprio site, não há terceiros nesse download.
export const VOZ_NO_PROPRIO_SITE = process.env.NEXT_PUBLIC_SELF_HOST === "1";
const nomes = VOICES.map((v) => `${v.name} (${v.lang})`);
export const VOZ = nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}` : nomes[0];

export const ATUALIZADO_EM = "20 de novembro de 2026";

export const camposPendentes = () => Object.values(LEGAL).filter((v) => v.includes("[PREENCHER"));
