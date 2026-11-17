// Dados legais do site, usados nas páginas /privacidade e /termos.
// 1) Preencha tudo que estiver entre [PREENCHER ...]. Enquanto houver algum campo assim,
//    as duas páginas mostram um aviso para você.
// 2) Ajuste os "recursos" mais abaixo para o que o site faz de verdade hoje.
import { VOICE_ID } from "@/lib/tts";

export const LEGAL = {
  nome: "[PREENCHER: seu nome completo ou a razão social]",
  documento: "[PREENCHER: CPF ou CNPJ]",
  endereco: "[PREENCHER: cidade e estado, ou endereço completo]",
  email: "[PREENCHER: e-mail de contato, ex.: contato@seudominio.com.br]",
  hospedagem: "[PREENCHER: nome da hospedagem do site, ex.: Vercel]",
  envioEmail: "[PREENCHER: serviço que envia os e-mails de acesso (o seu SMTP)]",
};

// Ligue (true) ou desligue (false) conforme o que o site faz de fato.
// Se o texto de uma página disser algo que o site não faz, ou deixar de dizer algo que ele faz, a página fica errada.
export const RECURSOS = {
  loginGoogle: true, // true quando existir o botão "Continuar com o Google"
  historicoNaNuvem: true, // true quando o plano Pro puder salvar textos no servidor
};

// Vem do mesmo ajuste usado em lib/selfhost.ts: se a voz é servida pelo próprio site, não há terceiros nesse download.
export const VOZ_NO_PROPRIO_SITE = process.env.NEXT_PUBLIC_SELF_HOST === "1";
export const VOZ = VOICE_ID;

export const ATUALIZADO_EM = "17 de novembro de 2026";

export const camposPendentes = () => Object.values(LEGAL).filter((v) => v.includes("[PREENCHER"));
