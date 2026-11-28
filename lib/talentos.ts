import { LEGAL } from "@/lib/legal";
import { TOOLS } from "@/lib/tools";

// Quem quer ajudar a melhorar o Sauim. Tudo vira um e-mail pronto (mailto): nada é guardado em servidor.
export const AREAS = ["Desenvolvimento de software", "Design e interface", "Voz, áudio e vídeo", "Redação e conteúdo", "Testes e qualidade", "Outra área"];
export const FORMATS = ["Projeto pontual (freelancer)", "Dedicação fixa em home office", "Tanto faz"];

export const BETA_TOOLS = TOOLS.filter((t) => t.beta);

export function helpMailto(opts: { tool?: string; area: string; format?: string }): string {
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
  return `mailto:${LEGAL.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
