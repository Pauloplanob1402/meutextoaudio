// Descrição para o YouTube, montada a partir do roteiro. Sem IA: usa regras e fórmulas de título.
// O YouTube aceita até 5.000 caracteres; o tamanho é escolhido pela pessoa e as primeiras linhas valem mais.
import { countWords, makeHashtags, speechSeconds } from "./toolkit";

export const DESC_LIMIT = 5000; // limite do YouTube
export const SIZES = [
  { id: 500, label: "Curta (até 500)" },
  { id: 1200, label: "Média (até 1.200)" },
  { id: 5000, label: "Completa (até 5.000)" },
] as const;

const STOP = new Set(
  ("para com uma uns umas dos das nos nas num numa pelo pela pelos pelas que quem qual quais como mais menos muito muita muitos muitas " +
    "isso isto esse essa esses essas este esta estes estas aquele aquela aqui ali ela ele eles elas voce voces você vocês nao não sim " +
    "mas porque porquê pois entao então ainda ja já tambem também sobre entre depois antes sempre nunca todo toda todos todas cada " +
    "tem tinha temos tenho vai vou vamos foi era ser sido estar esta está estou estao estão ficar fazer faz fazendo feito pode podem " +
    "quando onde enquanto desde ate até seja sao são sua seu suas seus minha meu minhas meus nosso nossa coisa coisas gente vez vezes " +
    "bem apenas so só próximo próxima primeiro primeira segundo poucos pouco horas hora minutos passou fazer vídeo video canal inscreve inscrever bora hoje agora aí ai então").split(/\s+/)
);

// ---------- limpeza e frases ----------
export function cleanScript(raw: string): string {
  return raw
    .replace(/\[[^\]]*\]/g, " ") // marcas como [PAUSA - 2 segundos]
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sentencesOf(text: string): string[] {
  return (text.match(/[^.!?…]+[.!?…]*/g) ?? []).map((s) => s.trim()).filter((s) => countWords(s) >= 4);
}

const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

export function keywordsOf(text: string, max = 5): string[] {
  const freq = new Map<string, number>();
  for (const w of words(text)) {
    if (w.length < 4 || STOP.has(w) || /^\d+$/.test(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, max)
    .map(([w]) => w);
}

// ---------- frase de abertura (headline) ----------
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export type Headline = { kind: string; text: string };

export function headlines(subject: string, minutes: number | null, hookSentence: string | null): Headline[] {
  const s = subject.trim();
  const out: Headline[] = [];
  if (s) {
    out.push({ kind: "Curiosidade", text: `${cap(s)}: o que ninguém te conta` });
    if (minutes) out.push({ kind: "Promessa com tempo", text: `Em ${minutes} ${minutes === 1 ? "minuto" : "minutos"}, você entende ${s.toLowerCase()}` });
    out.push({ kind: "Erro comum", text: `${cap(s)}: o erro que quase todo mundo comete` });
    out.push({ kind: "Promessa direta", text: `${cap(s)} sem enrolação, do começo ao fim` });
    out.push({ kind: "Alerta", text: `Antes de postar, veja isto sobre ${s.toLowerCase()}` });
  }
  if (hookSentence && hookSentence.length <= 90) out.push({ kind: "Abertura do seu roteiro", text: hookSentence });
  return out;
}

// ---------- montagem dentro do limite ----------
function trimToBudget(text: string, budget: number): string {
  if (text.length <= budget) return text;
  if (budget <= 0) return "";
  const cut = text.slice(0, budget);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (end > budget * 0.5) return cut.slice(0, end + 1).trim();
  const sp = cut.lastIndexOf(" ");
  return (sp > 0 ? cut.slice(0, sp) : cut).replace(/[,;:\s]+$/, "") + ".";
}

export type DescParts = { headline: string; summary: string; link: string; cta: string; tags: string[] };

export function assemble(p: DescParts, limit = DESC_LIMIT): string {
  const head = p.headline.trim();
  const tags = p.tags.join(" ");
  const cta = p.cta.trim();
  const link = p.link.trim() ? `Acesse: ${p.link.trim()}` : "";
  const join = (a: string[]) => a.filter(Boolean).join("\n\n");
  let tail = [link, cta, tags];
  // se o fixo já estoura o limite, tira primeiro as hashtags, depois o convite e o link
  while (join([head, ...tail]).length > limit && tail.some(Boolean)) {
    if (tail[2]) tail = [tail[0], tail[1], ""];
    else if (tail[1]) tail = [tail[0], "", ""];
    else tail = ["", "", ""];
  }
  const fixed = join([head, ...tail]);
  const room = limit - fixed.length - (p.summary.trim() ? 2 : 0);
  const summary = p.summary.trim() ? trimToBudget(p.summary.trim(), room) : "";
  return join([head, summary, ...tail]);
}

// ---------- tudo junto ----------
export type DescOptions = { subject: string; channel: string; cta: string; link: string; size: number };

export type DescVariant = { kind: string; text: string; visible: string };

export function buildDescriptions(rawScript: string, o: DescOptions): { variants: DescVariant[]; subject: string; keywords: string[] } {
  const clean = cleanScript(rawScript);
  const sents = sentencesOf(clean);
  const keywords = keywordsOf(clean);
  const subject = o.subject.trim() || keywords[0] || "";
  const secs = speechSeconds(rawScript, 150).seconds;
  const minutes = countWords(clean) >= 60 ? Math.max(1, Math.round(secs / 60)) : null;

  // resumo: as frases que mais repetem as palavras-chave do roteiro, na ordem em que aparecem no vídeo
  const kset = new Set(keywords);
  const ranked = sents
    .map((t, i) => ({ t, i, score: words(t).filter((w) => kset.has(w)).length / Math.sqrt(words(t).length) }))
    .filter((x) => x.t.length >= 40 && x.t.length <= 260)
    .sort((a, b) => b.score - a.score);
  // quanto cabe no resumo: o tamanho escolhido menos headline, link, convite e hashtags (estimativa)
  const budget = Math.max(120, o.size - 180 - o.link.length - o.cta.length);
  const pick = (must: number[] = []) => {
    const chosen = new Set<number>(must);
    let used = must.reduce((n, i) => n + sents[i].length + 1, 0);
    for (const r of ranked) {
      if (chosen.has(r.i)) continue;
      if (used + r.t.length + 1 > budget) continue;
      chosen.add(r.i);
      used += r.t.length + 1;
    }
    const list = [...chosen].sort((a, b) => a - b).map((i) => sents[i]);
    const paras: string[] = []; // dois períodos por parágrafo, para ler com folga
    for (let i = 0; i < list.length; i += 2) paras.push(list.slice(i, i + 2).join(" "));
    return paras.join("\n\n");
  };
  const firstIdx = sents.findIndex((t) => t.length >= 40 && t.length <= 260);
  const bestOnly = ranked[0] ? sents[ranked[0].i] : sents[0] ?? "";
  const summaries = [pick(), firstIdx >= 0 ? pick([firstIdx]) : pick(), o.size >= 1200 ? pick() : bestOnly];

  const cta = o.cta.trim() || (o.channel.trim() ? `Gostou? Inscreva-se no ${o.channel.trim()}.` : "Gostou? Inscreva-se no canal.");
  const tags = makeHashtags([o.subject.trim(), ...keywords].filter(Boolean).slice(0, 5).join(", "), { max: 5 });
  const hook = sents[0] && /[?!]$|\d/.test(sents[0]) ? sents[0] : null;
  const heads = headlines(subject, minutes, hook).slice(0, 3);

  const variants: DescVariant[] = heads.map((h, i) => {
    const text = assemble({ headline: h.text, summary: summaries[i % summaries.length], link: o.link, cta, tags }, o.size);
    return { kind: h.kind, text, visible: text.slice(0, 150) };
  });
  return { variants, subject, keywords };
}
