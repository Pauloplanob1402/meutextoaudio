// Ferramentas de peso médio, sem IA: testador de títulos, descrição, limpador de roteiro, frequência.
// Arquivo sem dependências, para ser fácil de testar.

// =====================================================================
// Testador de títulos (regras fixas, nota de 0 a 100)
// =====================================================================
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const POWER = ["segredo", "erro", "erros", "nunca", "gratis", "rapido", "simples", "facil", "verdade", "mito", "mitos", "melhor", "pior", "testei", "sem ", "passo a passo", "dicas", "truque", "descobri", "perigo", "cuidado", "antes de", "atalho"];
const CURIOSITY = ["?", "como ", "por que", "porque", "o que ", "segredo", "verdade", "mito", "testei", "descobri", "ninguem", "quase ninguem", "o motivo"];
const CLICKBAIT = ["nao vai acreditar", "vai te chocar", "chocante", "bomba", "inacreditavel", "voce nao imagina", "urgente!!"];

export type TitleRule = { id: string; label: string; ok: boolean; weight: number; tip: string };
export type TitleScore = { score: number; rules: TitleRule[]; len: number };

export function scoreTitle(title: string, keyword = ""): TitleScore {
  const t = title.trim();
  const n = norm(t);
  const len = t.length;
  const letters = t.replace(/[^A-Za-zÀ-ÿ]/g, "");
  const upperRatio = letters.length ? (t.replace(/[^A-ZÀ-Þ]/g, "").length / letters.length) : 0;
  const rules: TitleRule[] = [
    { id: "tamanho", weight: 20, ok: len >= 30 && len <= 65, label: "Tamanho entre 30 e 65 caracteres", tip: len < 30 ? "Está curto: acrescente o benefício ou o resultado." : "Está longo: o YouTube corta o final. Enxugue até 65." },
    { id: "numero", weight: 10, ok: /\d/.test(t), label: "Tem um número", tip: "Números dão forma ao vídeo (“5 erros”, “em 10 minutos”)." },
    { id: "curiosidade", weight: 15, ok: CURIOSITY.some((w) => n.includes(w)), label: "Desperta curiosidade ou promete uma resposta", tip: "Use uma pergunta, “como”, “por que” ou algo que a pessoa só descobre no vídeo." },
    { id: "poder", weight: 10, ok: POWER.some((w) => n.includes(w)), label: "Tem uma palavra de benefício ou de atenção", tip: "Palavras como “simples”, “erro”, “sem”, “passo a passo” dão motivo para clicar." },
    { id: "caixa", weight: 10, ok: upperRatio < 0.3, label: "Não está todo em maiúsculas", tip: "Maiúsculas demais cansam e passam desconfiança." },
    { id: "pontuacao", weight: 5, ok: !/[!?]{2,}/.test(t) && (t.match(/!/g) ?? []).length <= 1, label: "Sem exagero de pontuação", tip: "Use no máximo uma exclamação e nenhum “!!” ou “???”." },
    { id: "isca", weight: 10, ok: !CLICKBAIT.some((w) => n.includes(w)), label: "Sem frases vazias de isca", tip: "Evite “você não vai acreditar”. Diga o que a pessoa vai ver de verdade." },
  ];
  const kw = norm(keyword.trim());
  if (kw) {
    const pos = n.indexOf(kw);
    rules.unshift({ id: "keyword", weight: 20, ok: pos >= 0 && pos <= 40, label: "A palavra-chave aparece no começo", tip: pos < 0 ? "A palavra-chave não está no título." : "Leve a palavra-chave para os primeiros 40 caracteres." });
  }
  if (!t) return { score: 0, rules, len };
  const total = rules.reduce((s, r) => s + r.weight, 0);
  const got = rules.reduce((s, r) => s + (r.ok ? r.weight : 0), 0);
  return { score: Math.round((got / total) * 100), rules, len };
}

export const titleLabel = (s: number) => (s >= 80 ? "Forte" : s >= 60 ? "Bom" : s >= 40 ? "Regular" : "Fraco");

// =====================================================================
// Gerador de descrição por modelo
// =====================================================================
export type DescInput = { resumo: string; pontos: string; cta: string; capitulos: string; links: string; sobre: string; hashtags: string };

export const DEFAULT_CTA = "Se este vídeo ajudou, deixe o seu like e se inscreva no canal para não perder o próximo.";

export function normHashtags(s: string, max = 3): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of s.split(/[\s,;]+/)) {
    const w = raw.replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, "");
    if (!w || seen.has(w.toLowerCase())) continue;
    seen.add(w.toLowerCase());
    out.push("#" + w);
    if (out.length >= max) break;
  }
  return out;
}

export function buildDescription(i: DescInput): string {
  const parts: string[] = [];
  const resumo = i.resumo.trim();
  if (resumo) parts.push(resumo);
  const pts = i.pontos.split("\n").map((l) => l.replace(/^[-•*\s]+/, "").trim()).filter(Boolean);
  if (pts.length) parts.push(["Neste vídeo:", ...pts.map((p) => `• ${p}`)].join("\n"));
  if (i.cta.trim()) parts.push(i.cta.trim());
  if (i.capitulos.trim()) parts.push(["CAPÍTULOS", i.capitulos.trim()].join("\n"));
  if (i.links.trim()) parts.push(["LINKS", i.links.trim()].join("\n"));
  if (i.sobre.trim()) parts.push(["SOBRE O CANAL", i.sobre.trim()].join("\n"));
  const tags = normHashtags(i.hashtags);
  if (tags.length) parts.push(tags.join(" "));
  return parts.join("\n\n");
}

// =====================================================================
// Limpador de roteiro para falar
// =====================================================================
const UN = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const TENS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const HUND = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

export function numberToWords(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 999_999_999 || !Number.isInteger(n)) return String(n);
  if (n < 20) return UN[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " e " + UN[n % 10] : "");
  if (n < 1000) return n === 100 ? "cem" : HUND[Math.floor(n / 100)] + (n % 100 ? " e " + numberToWords(n % 100) : "");
  const link = (r: number) => (r < 100 || r % 100 === 0 ? " e " : " ");
  if (n < 1_000_000) {
    const th = Math.floor(n / 1000), r = n % 1000;
    return (th === 1 ? "mil" : numberToWords(th) + " mil") + (r ? link(r) + numberToWords(r) : "");
  }
  const m = Math.floor(n / 1_000_000), r = n % 1_000_000;
  return (m === 1 ? "um milhão" : numberToWords(m) + " milhões") + (r ? link(r) + numberToWords(r) : "");
}

const ABBR: [RegExp, string][] = [
  [/\bp\.\s?ex\.?/gi, "por exemplo"], [/\bex\.:?/gi, "por exemplo"], [/\betc\.?/gi, "e assim por diante"],
  [/\bDr\./g, "doutor"], [/\bDra\./g, "doutora"], [/\bSr\./g, "senhor"], [/\bSra\./g, "senhora"], [/\bProf\./g, "professor"],
  [/\bvc\b/gi, "você"], [/\bvcs\b/gi, "vocês"], [/\btb\b/gi, "também"], [/\bpq\b/gi, "porque"], [/\bobs\.:?/gi, "observação:"],
  [/\bnº\s?/gi, "número "], [/\bkm\b/gi, "quilômetros"], [/\bkg\b/gi, "quilos"],
];

export type CleanOptions = { numbers: boolean; abbr: boolean; urls: boolean; symbols: boolean; parens: boolean };
export const DEFAULT_CLEAN: CleanOptions = { numbers: true, abbr: true, urls: true, symbols: true, parens: true };

const intWords = (s: string) => numberToWords(parseInt(s.replace(/\./g, ""), 10));
const decWords = (d: string) => (d.startsWith("0") ? d.split("").map((c) => UN[+c]).join(" ") : intWords(d));

export function cleanForSpeech(text: string, o: CleanOptions = DEFAULT_CLEAN): string {
  let t = text.replace(/\r/g, "");
  if (o.urls) t = t.replace(/(?:https?:\/\/|www\.)[^\s]*[^\s.,;:!?)]/gi, "o link na descrição");
  if (o.symbols) {
    t = t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "");
    t = t.replace(/^\s{0,3}#{1,6}\s+/gm, "").replace(/[*_`~>]+/g, "").replace(/^\s*[-•]\s+/gm, "").replace(/\s*[—–]\s*/g, ", ").replace(/\s+-\s+/g, ", ").replace(/…/g, "...");
    t = t.replace(/&/g, " e ").replace(/\s\/\s/g, " ou ");
  }
  if (o.abbr) for (const [re, rep] of ABBR) t = t.replace(re, rep);
  if (o.parens) t = t.replace(/\s*\(([^)]*)\)/g, (_m, inner: string) => `, ${inner.trim()},`).replace(/,\s*,/g, ",").replace(/,\s*([.!?])/g, "$1");
  if (o.numbers) {
    t = t.replace(/R\$\s?(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{2}))?/g, (_m, a: string, c?: string) => {
      const r = parseInt(a.replace(/\./g, ""), 10);
      const reais = `${intWords(a)} ${r === 1 ? "real" : "reais"}`;
      const cents = c ? parseInt(c, 10) : 0;
      return cents ? `${reais} e ${numberToWords(cents)} ${cents === 1 ? "centavo" : "centavos"}` : reais;
    });
    t = t.replace(/(\d+(?:,\d+)?)\s?%/g, (_m, a: string) => `${a.includes(",") ? a.replace(/^(\d+),(\d+)$/, (_x, i: string, d: string) => `${intWords(i)} vírgula ${decWords(d)}`) : intWords(a)} por cento`);
    t = t.replace(/\b(\d{1,2})\s?h(?:(\d{2}))?\b/g, (_m, h: string, mm?: string) => `${intWords(h)} ${+h === 1 ? "hora" : "horas"}${mm ? " e " + numberToWords(parseInt(mm, 10)) : ""}`);
    t = t.replace(/(?<![\d/:.,])(\d{1,3}(?:\.\d{3})+)(?![\d/:])/g, (_m, a: string) => intWords(a));
    t = t.replace(/(?<![\d/:.,])(\d+),(\d+)(?![\d/:])/g, (_m, i: string, d: string) => `${intWords(i)} vírgula ${decWords(d)}`);
    t = t.replace(/(?<![\d/:.,])(\d+)(?![\d/:,]\d)(?!\d)/g, (m) => (m.length <= 9 ? intWords(m) : m));
  }
  // concordância depois de trocar o link e capitalização no começo das frases
  t = t.replace(/\bem o link/g, "no link").replace(/\bde o link/g, "do link").replace(/\bpor o link/g, "pelo link").replace(/\ba o link/g, "ao link");
  t = t.replace(/(^|[.!?]\s+|\n)(\p{Ll})/gu, (_m, a: string, c: string) => a + c.toUpperCase());
  t = t.replace(/[ \t]+/g, " ").replace(/ +([,.!?;:])/g, "$1").replace(/\n{3,}/g, "\n\n").replace(/ *\n */g, "\n").trim();
  return t;
}

export type SpeechIssues = { longSentences: { text: string; words: number }[]; acronyms: string[]; digitsLeft: number };

export function speechIssues(text: string, maxWords = 25): SpeechIssues {
  const sentences = text.split(/(?<=[.!?…])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  const wc = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;
  const longSentences = sentences.map((s) => ({ text: s, words: wc(s) })).filter((s) => s.words > maxWords);
  const acronyms = [...new Set(text.match(/\b[A-ZÀ-Þ]{2,6}\b/g) ?? [])].filter((w) => !["EU", "OI", "UM", "EM", "DE", "DO", "DA", "NA", "NO"].includes(w));
  return { longSentences, acronyms, digitsLeft: (text.match(/\d/g) ?? []).length };
}

// =====================================================================
// Calculadora de frequência (tempo disponível -> ritmo -> data da meta)
// =====================================================================
export type FreqInput = { hoursWeek: number; hoursPerVideo: number; subsNow: number; subsGoal: number; subsPerVideo: number };

export type Scenario = { perWeek: number; weeks: number; date: Date; label: string };
export type FreqResult = { possible: number; videosNeeded: number; scenarios: Scenario[]; ok: boolean; note: string };

export function planFrequency(i: FreqInput, today = new Date()): FreqResult {
  const ok = i.hoursWeek > 0 && i.hoursPerVideo > 0 && i.subsPerVideo > 0 && i.subsGoal > i.subsNow;
  if (!ok) return { possible: 0, videosNeeded: 0, scenarios: [], ok: false, note: "Preencha as horas, a média de inscritos por vídeo e uma meta maior que os inscritos atuais." };
  const possible = Math.max(1, Math.floor((i.hoursWeek / i.hoursPerVideo) * 100) / 100);
  const recommended = Math.max(1, Math.floor(i.hoursWeek / i.hoursPerVideo));
  const videosNeeded = Math.ceil((i.subsGoal - i.subsNow) / i.subsPerVideo);
  const rates = [...new Set([1, 2, 3, recommended])].sort((a, b) => a - b);
  const scenarios = rates.map((perWeek) => {
    const weeks = Math.ceil(videosNeeded / perWeek);
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + weeks * 7);
    return { perWeek, weeks, date, label: perWeek === recommended ? "Cabe no seu tempo" : perWeek > recommended ? "Acima do seu tempo" : "Mais leve" };
  });
  const note = recommended < 1 ? "" : `Com ${i.hoursWeek} h por semana e ${i.hoursPerVideo} h por vídeo, cabem cerca de ${possible.toLocaleString("pt-BR")} vídeos por semana. Publicar acima disso tende a cansar e baixar a qualidade.`;
  return { possible: recommended, videosNeeded, scenarios, ok: true, note };
}
