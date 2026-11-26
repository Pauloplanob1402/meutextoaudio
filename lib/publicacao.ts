// Pacote de publicação: títulos para testar, descrição pronta (com os capítulos), hashtags e comentário fixado.
// Reaproveita a ferramenta "Descrição a partir do roteiro". Sem IA: regras e fórmulas; a pessoa edita antes de publicar.
import { DESC_LIMIT, buildDescriptions } from "@/lib/descricao";

export type PubInput = { channel: string; cta: string; link: string; subject?: string };

export type Publicacao = {
  subject: string;
  titles: { kind: string; text: string; length: number }[];
  descriptions: string[]; // uma para cada título (mesma posição), já com os capítulos
  hashtags: string[];
  pinned: string;
};

// O mesmo convite padrão da ferramenta de descrição
const ctaOf = (o: PubInput) => o.cta.trim() || (o.channel.trim() ? `Gostou? Inscreva-se no ${o.channel.trim()}.` : "Gostou? Inscreva-se no canal.");

// Coloca os capítulos antes do convite (ou antes das hashtags, ou no fim)
export function withChapters(text: string, chapters: string, cta: string): string {
  if (!chapters.trim()) return text;
  const paras = text.split("\n\n");
  let at = paras.findIndex((p) => p.trim() === cta.trim());
  if (at < 0) at = paras.findIndex((p) => p.trim().startsWith("#"));
  if (at < 0) at = paras.length;
  paras.splice(at, 0, "Capítulos:\n" + chapters.trim());
  return paras.join("\n\n");
}

export function buildPublicacao(raw: string, chapters: string, o: PubInput): Publicacao | null {
  if (raw.replace(/\[[^\]]*\]/g, " ").trim().length < 40) return null;
  const d = buildDescriptions(raw, { subject: o.subject ?? "", channel: o.channel, cta: o.cta, link: o.link, size: 1200 });
  if (!d.variants.length) return null;
  const cta = ctaOf(o);
  const titles = d.variants.map((v) => {
    const text = v.text.split("\n\n")[0].trim();
    return { kind: v.kind, text, length: text.length };
  });
  const descriptions = d.variants.map((v) => withChapters(v.text, chapters, cta));
  const hashtags = d.variants[0].text.match(/#[^\s#]+/g) ?? [];
  const about = d.subject ? `sobre ${d.subject}` : "deste vídeo";
  const pinned = `Qual foi a sua maior dúvida ${about}? Responda aqui, a gente lê os comentários.${chapters.trim() ? "\n\nOs capítulos estão na descrição." : ""}`;
  return { subject: d.subject, titles, descriptions, hashtags, pinned };
}

export { DESC_LIMIT };
