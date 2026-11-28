import { LEGAL } from "@/lib/legal";
import { TOOLS } from "@/lib/tools";

// Quem quer ajudar a melhorar o Sauim. Tudo vira um e-mail pronto (mailto): nada é guardado em servidor.
export const AREAS = ["Desenvolvimento de software", "Design e interface", "Voz, áudio e vídeo", "Redação e conteúdo", "Testes e qualidade", "Outra área"];
export const FORMATS = ["Projeto pontual (freelancer)", "Dedicação fixa em home office", "Tanto faz"];

export const BETA_TOOLS = TOOLS.filter((t) => t.beta);

type HelpOpts = { tool?: string; area: string; format?: string };

// Assunto e texto do e-mail de quem quer ajudar. Vale para todos os caminhos (programa de e-mail, Gmail, Outlook, copiar).
export function helpContent(opts: HelpOpts): { to: string; subject: string; body: string } {
  const tool = opts.tool?.trim();
  const subject = `${tool ? `[Ajudar: ${tool}]` : "[Quero ajudar o Sauim]"} ${opts.area}`;
  const body = [
    "Oi, Sauim! Quero ajudar.",
    "",
    `Ferramenta: ${tool || "(geral)"}`,
    `Minha área: ${opts.area}`,
    `Formato que busco: ${opts.format || "Tanto faz"}`,
    "",
    "Nome:",
    "WhatsApp (opcional):",
    "Link do meu portfólio, GitHub ou LinkedIn:",
    "Como eu posso ajudar o Sauim a crescer (em poucas linhas):",
  ].join("\n");
  return { to: LEGAL.email, subject, body };
}

const enc = encodeURIComponent;

// 1) Programa de e-mail do computador ou do celular. Só funciona se houver um programa configurado: por isso há os outros três.
export function helpMailto(opts: HelpOpts): string {
  const c = helpContent(opts);
  return `mailto:${c.to}?subject=${enc(c.subject)}&body=${enc(c.body)}`;
}
// 2) Gmail no navegador (abre a tela de escrever já preenchida).
export function helpGmail(opts: HelpOpts): string {
  const c = helpContent(opts);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(c.to)}&su=${enc(c.subject)}&body=${enc(c.body)}`;
}
// 3) Outlook.com / Hotmail no navegador.
export function helpOutlook(opts: HelpOpts): string {
  const c = helpContent(opts);
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(c.to)}&subject=${enc(c.subject)}&body=${enc(c.body)}`;
}
// 4) Texto para copiar e colar em qualquer e-mail.
export function helpPlainText(opts: HelpOpts): string {
  const c = helpContent(opts);
  return `Para: ${c.to}\nAssunto: ${c.subject}\n\n${c.body}`;
}
