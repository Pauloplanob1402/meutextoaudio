// Funções puras das ferramentas de lógica (sem IA, sem tela, fáceis de testar).
// Tudo aqui roda no navegador de quem usa: custo zero de servidor.
import { countWords } from "./toolkit";

// =====================================================================
// 1. Validador de gancho (checklist com nota de 0 a 100)
// =====================================================================
export type HookCriterion = { id: string; label: string; help: string; weight: number; fix: string };

export const HOOK_CRITERIA: HookCriterion[] = [
  { id: "problema", weight: 15, label: "Mostra um problema ou desejo urgente nos primeiros 5 segundos", help: "A pessoa precisa se reconhecer logo na primeira frase.", fix: "Abra com o problema (ou o desejo) da pessoa, não com a sua apresentação." },
  { id: "curiosidade", weight: 15, label: "Abre um loop de curiosidade (uma pergunta que só o vídeo responde)", help: "Algo que a pessoa só descobre se continuar assistindo.", fix: "Faça uma pergunta, ou prometa uma revelação, e só responda mais adiante." },
  { id: "climax", weight: 10, label: "Mostra um pedaço do resultado ou do clímax logo no início", help: "Um vislumbre do final: o antes e depois, a cena mais forte, o número final.", fix: "Coloque 2 ou 3 segundos da melhor parte do vídeo logo no começo." },
  { id: "publico", weight: 10, label: "Fala com uma pessoa específica (fica claro para quem é o vídeo)", help: "“Para quem edita no celular” funciona melhor que “para todo mundo”.", fix: "Cite o público na primeira frase: quem é, o que faz, o que quer." },
  { id: "beneficio", weight: 10, label: "Promete um benefício concreto (o que a pessoa vai ganhar)", help: "Tempo, dinheiro, resultado, alívio. Algo que dê para imaginar.", fix: "Diga o que a pessoa leva ao final, com número ou prazo se puder." },
  { id: "curto", weight: 10, label: "A primeira frase é curta (até 12 palavras)", help: "Frase longa no começo faz a pessoa sair antes da graça chegar.", fix: "Corte a primeira frase pela metade. Vá direto ao ponto." },
  { id: "semintro", weight: 10, label: "Não começa com apresentação, cumprimento ou “hoje eu vou falar sobre”", help: "“Oi, pessoal, tudo bem?” gasta os 5 segundos mais valiosos.", fix: "Apague o cumprimento do começo e deixe para depois do gancho." },
  { id: "surpresa", weight: 10, label: "Tem uma surpresa, um contraste ou algo que a pessoa não espera", help: "Um fato inesperado, uma contradição, um “parece, mas não é”.", fix: "Procure o que mais surpreende no tema e traga isso para a frente." },
  { id: "risco", weight: 5, label: "Deixa claro o que a pessoa perde se não assistir", help: "O que acontece se ela continuar fazendo do jeito antigo?", fix: "Mostre o custo de continuar como está (tempo, dinheiro, erro repetido)." },
  { id: "promessa", weight: 5, label: "Cumpre a promessa do título e da miniatura", help: "Quem clicou pelo título precisa reconhecer aquilo nos primeiros segundos.", fix: "Repita, com outras palavras, a promessa do título logo no começo." },
];

export type HookResult = {
  score: number;
  level: "fraco" | "regular" | "bom" | "forte";
  label: string;
  message: string;
  missing: HookCriterion[];
};

export function scoreHook(checked: string[]): HookResult {
  const set = new Set(checked);
  const score = HOOK_CRITERIA.reduce((s, c) => s + (set.has(c.id) ? c.weight : 0), 0);
  const missing = HOOK_CRITERIA.filter((c) => !set.has(c.id)).sort((a, b) => b.weight - a.weight);
  let level: HookResult["level"] = "fraco";
  let label = "Gancho fraco";
  let message = "Muita gente vai sair nos primeiros segundos. Comece pelos itens abaixo.";
  if (score >= 90) { level = "forte"; label = "Gancho forte"; message = "Está muito bom. Agora grave e assista com olhos de quem nunca viu o vídeo."; }
  else if (score >= 70) { level = "bom"; label = "Gancho bom"; message = "Falta pouco. Acerte o que está listado abaixo e ele fica forte."; }
  else if (score >= 40) { level = "regular"; label = "Gancho regular"; message = "Tem base, mas ainda deixa a pessoa escapar. Veja o que falta."; }
  return { score, level, label, message, missing };
}

// Aberturas que gastam os primeiros segundos (checagem do texto do gancho, sem IA)
const WEAK_OPENERS: RegExp[] = [
  /^\s*(oi|olá|ola|e aí|e ai|fala)\b/i,
  /^\s*(bem[- ]vindos?|boas[- ]vindas)/i,
  /^\s*(tudo bem|como vão|como vai)/i,
  /\b(meu nome é|eu sou o|eu sou a)\b/i,
  /\b(hoje (eu )?(vou|vamos) (falar|mostrar|ensinar|ver|trazer))/i,
  /\b(nesse|neste) vídeo (eu )?(vou|vamos)/i,
  /\b(antes de (começar|mais nada)|se inscreva|inscreva-se|deixa o like)/i,
];

export function analyzeHookText(text: string, wpm = 150) {
  const clean = text.trim();
  const words = countWords(clean);
  const seconds = (words / Math.max(wpm, 1)) * 60;
  const first = (clean.split(/(?<=[.!?…])\s+|\n/)[0] ?? "").trim();
  const firstWords = countWords(first);
  const weakOpener = WEAK_OPENERS.some((r) => r.test(clean.slice(0, 160)));
  const hasQuestion = /\?/.test(clean);
  const hasNumber = /\d/.test(clean);
  const notes: string[] = [];
  if (words) {
    if (seconds > 8) notes.push(`Seu gancho tem cerca de ${Math.round(seconds)} segundos falado. O ideal é até 5 a 8.`);
    if (firstWords > 12) notes.push(`A primeira frase tem ${firstWords} palavras. Tente chegar em 12 ou menos.`);
    if (weakOpener) notes.push("O começo parece uma apresentação (cumprimento, “hoje vou falar sobre”…). Experimente abrir direto pelo problema ou pelo resultado.");
    if (!hasQuestion && !hasNumber) notes.push("Dica: uma pergunta ou um número concreto costuma prender mais a atenção.");
  }
  return { words, seconds, firstWords, weakOpener, hasQuestion, hasNumber, notes };
}

// =====================================================================
// 2. Cruzador de nicho (os 3 P's: Paixão, Habilidade e Demanda)
// =====================================================================
export const SKILLS = [
  "Explicar e ensinar",
  "Mostrar fazendo (tutorial)",
  "Contar histórias e entreter",
  "Analisar e opinar",
  "Criar e produzir",
  "Pesquisar e reunir informação",
] as const;

export const DEMANDS = [
  "Resolver um problema",
  "Aprender algo novo",
  "Se divertir e relaxar",
  "Se inspirar e ganhar motivação",
  "Decidir uma compra ou escolha",
  "Ficar por dentro das novidades",
] as const;

// {p} é trocado pela paixão digitada. [formato, título de exemplo]
const MATRIX: [string, string][][] = [
  // Explicar e ensinar
  [
    ["Passo a passo", "Como resolver {p} em 5 passos simples"],
    ["Aula rápida", "{p} explicado em 5 minutos, sem complicação"],
    ["Explicação com humor", "{p} explicado como se fosse uma novela"],
    ["Lição de vida", "O que {p} me ensinou sobre nunca desistir"],
    ["Guia de escolha", "Como escolher em {p}: o que olhar antes de decidir"],
    ["Resumo do que mudou", "O que mudou em {p} e o que realmente importa"],
  ],
  // Mostrar fazendo
  [
    ["Tutorial na tela ou na bancada", "Faça isto em {p} hoje: do zero ao resultado"],
    ["Demonstração do começo ao fim", "Aprendi {p} em 7 dias e mostrei tudo"],
    ["Desafio ao vivo", "Tentei {p} pela primeira vez (olha no que deu)"],
    ["Antes e depois", "Antes e depois em {p}: o que mudou de verdade"],
    ["Teste lado a lado", "Testei 3 opções de {p}: só uma valeu a pena"],
    ["Teste da novidade", "Testei a novidade de {p} para você não perder tempo"],
  ],
  // Contar histórias
  [
    ["História de um erro", "O erro em {p} que quase me fez desistir"],
    ["Narrativa com reviravolta", "A história improvável por trás de {p}"],
    ["Storytime leve", "Contei tudo que aconteceu comigo em {p}"],
    ["História de superação", "Como saí do zero em {p} (história real)"],
    ["Conto sobre uma escolha", "Quase comprei errado em {p}: o que aprendi"],
    ["Bastidores", "Os bastidores de {p} que ninguém conta"],
  ],
  // Analisar e opinar
  [
    ["Análise de causa", "Por que {p} dá errado (e como evitar)"],
    ["Mito ou verdade", "5 mitos sobre {p} que você ainda acredita"],
    ["Reação comentada", "Reagi a vídeos famosos sobre {p}"],
    ["Opinião com argumento", "Por que eu discordo da maioria em {p}"],
    ["Comparativo com veredito", "{p}: vale a pena? Meu veredito sem rodeios"],
    ["Análise de tendência", "Para onde {p} está indo nos próximos anos"],
  ],
  // Criar e produzir
  [
    ["Projeto resolvendo uma dor", "Criei uma solução caseira para {p}"],
    ["Processo criativo", "Como eu crio do zero em {p} (todo o processo)"],
    ["Criação em tempo acelerado", "Fiz isto em {p} em 1 hora (acelerado)"],
    ["Obra com propósito", "Fiz isto em {p} para quem precisava de esperança"],
    ["Montagem com orçamento", "Montei tudo de {p} gastando pouco"],
    ["Criação com a novidade", "Criei algo em {p} usando a ferramenta do momento"],
  ],
  // Pesquisar e reunir
  [
    ["Lista de soluções", "7 soluções para {p} que quase ninguém conhece"],
    ["Curadoria do que ler ou ver", "As 5 melhores fontes para aprender {p}"],
    ["Curiosidades", "10 curiosidades sobre {p} que vão te surpreender"],
    ["Histórias reais reunidas", "Pessoas que mudaram de vida com {p}"],
    ["Ranking", "Ranking de {p}: do pior ao melhor"],
    ["Resumo semanal", "Resumo da semana em {p}: o que você precisa saber"],
  ],
];

// Frase de abertura por demanda ({p} = paixão)
const DEMAND_HOOKS = [
  "Você já travou em {p}? Em poucos minutos isso acaba.",
  "Se eu tivesse que começar {p} do zero hoje, faria só isto.",
  "Prepare-se: o que aconteceu em {p} ninguém esperava.",
  "Quando pensei em desistir de {p}, uma coisa mudou tudo.",
  "Antes de gastar um centavo em {p}, assista a isto.",
  "Isto mudou em {p} esta semana e muda tudo para você.",
];

export type NicheIdea = { skill: string; demand: string; format: string; title: string; hook: string; main?: boolean };

export function crossNiche(passion: string, skillIdx: number, demandIdx: number): { ideas: NicheIdea[]; ok: boolean; note: string } {
  const p = passion.replace(/\s+/g, " ").trim();
  if (!p) return { ideas: [], ok: false, note: "Escreva a sua paixão (o assunto que você gosta) para ver as ideias." };
  if (p.length < 3) return { ideas: [], ok: false, note: "Escreva pelo menos 3 letras na paixão." };
  const sub = (s: string) => s.replace(/\{p\}/g, p);
  const mk = (si: number, di: number, main = false): NicheIdea => ({
    skill: SKILLS[si],
    demand: DEMANDS[di],
    format: MATRIX[si][di][0],
    title: sub(MATRIX[si][di][1]),
    hook: sub(DEMAND_HOOKS[di]),
    main,
  });
  const si = ((skillIdx % SKILLS.length) + SKILLS.length) % SKILLS.length;
  const di = ((demandIdx % DEMANDS.length) + DEMANDS.length) % DEMANDS.length;
  const ideas = [mk(si, di, true), mk(si, (di + 1) % DEMANDS.length), mk((si + 1) % SKILLS.length, di)];
  return { ideas, ok: true, note: "" };
}

// =====================================================================
// 3. Construtor de DNA de marca (assistente de 7 etapas)
// =====================================================================
export type BrandStep = { id: string; title: string; why: string; question: string; example: string };

export const BRAND_STEPS: BrandStep[] = [
  { id: "origem", title: "História de origem", why: "Todo canal forte tem um começo que as pessoas conseguem recontar.", question: "Qual é a história de origem do seu canal? O que aconteceu para você começar?", example: "Perdi horas editando áudio à mão e decidi criar um jeito simples de fazer isso." },
  { id: "credo", title: "Crença (o seu credo)", why: "A crença é a razão de existir, maior que o assunto do canal.", question: "Em que você acredita? Que ideia você defende em todo vídeo?", example: "Acredito que qualquer pessoa pode criar conteúdo bom sem gastar com programas caros." },
  { id: "simbolos", title: "Símbolos e ícones", why: "Cores, formas e elementos que fazem a pessoa reconhecer o canal em um segundo.", question: "Quais símbolos representam o canal? Cores, mascote, formato de miniatura, som de abertura.", example: "Azul e amarelo, texto grande na miniatura e um som de “plim” na abertura." },
  { id: "rituais", title: "Rituais", why: "Hábitos repetidos criam vínculo e fazem a pessoa voltar.", question: "Que ritual se repete em todo vídeo ou em toda semana?", example: "Todo vídeo termina com “a dica que cabe em um minuto”, e sai toda terça às 19h." },
  { id: "palavras", title: "Palavras sagradas", why: "O vocabulário próprio do canal. Quem usa essas palavras se sente da turma.", question: "Que palavras e expressões só o seu canal usa?", example: "“Bora simplificar”, “sem enrolação”, “time do áudio limpo”." },
  { id: "inimigo", title: "Quem não é o seu público", why: "Dizer a quem o canal não serve deixa claro a quem ele serve.", question: "Quem não é seu público? O que o canal combate ou recusa?", example: "Não é para quem quer fórmula mágica. Combato promessas de ficar rico em 7 dias." },
  { id: "lider", title: "Você como líder", why: "As pessoas seguem uma voz e um jeito, não só um assunto.", question: "Como é a sua voz, o seu jeito e o seu papel diante da turma?", example: "Sou o amigo que já errou antes e conta o atalho. Tom calmo, direto e bem-humorado." },
];

export function buildBrandSummary(name: string, answers: Record<string, string>): string {
  const head = `DNA DE MARCA${name.trim() ? ` · ${name.trim()}` : ""}`;
  const lines: string[] = [head, "=".repeat(head.length), ""];
  BRAND_STEPS.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.title.toUpperCase()}`);
    lines.push(s.question);
    lines.push((answers[s.id] ?? "").trim() || "(ainda não preenchido)");
    lines.push("");
  });
  const done = BRAND_STEPS.filter((s) => (answers[s.id] ?? "").trim()).length;
  lines.push(`Etapas preenchidas: ${done} de ${BRAND_STEPS.length}`);
  return lines.join("\n");
}

export function brandSentence(answers: Record<string, string>): string {
  const g = (id: string) => (answers[id] ?? "").trim().replace(/[.!?\s]+$/, "");
  const cred = g("credo");
  const lider = g("lider");
  const naoE = g("inimigo");
  if (!cred) return "";
  return `Acreditamos que ${cred.charAt(0).toLowerCase() + cred.slice(1).replace(/^acredito que /i, "")}.${lider ? ` Quem guia é: ${lider.charAt(0).toLowerCase() + lider.slice(1)}.` : ""}${naoE ? ` Não é para: ${naoE.charAt(0).toLowerCase() + naoE.slice(1)}.` : ""}`;
}

// =====================================================================
// 4. Simulador de CTR (prévia de título na vitrine do YouTube)
// =====================================================================
// Limites aproximados (o YouTube muda o layout de vez em quando: é uma estimativa).
export const TITLE_LIMITS = { desktop: 62, mobile: 48, pc: 100 };

export function titleFit(title: string) {
  const len = title.trim().length;
  return {
    len,
    desktopCut: len > TITLE_LIMITS.desktop,
    mobileCut: len > TITLE_LIMITS.mobile,
    tooLong: len > TITLE_LIMITS.pc,
  };
}

export function cutTitle(title: string, max: number): string {
  const t = title.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

// =====================================================================
// 5. Gerador de roteiro em blocos (cada bloco com tempo de fala)
// =====================================================================
export type ScriptBlock = { id: string; title: string; range: string; target: [number, number]; hint: string; placeholder: string };

export const SCRIPT_BLOCKS: ScriptBlock[] = [
  { id: "gancho", title: "Gancho", range: "0 a 5 s", target: [3, 8], hint: "Uma ou duas frases que prendem. Nada de apresentação.", placeholder: "Você sabe por que o seu vídeo perde metade da audiência nos primeiros 10 segundos?" },
  { id: "contexto", title: "Contexto", range: "5 a 30 s", target: [10, 30], hint: "Diga o que a pessoa vai ver e por que isso importa para ela.", placeholder: "Neste vídeo você vai ver o método simples que eu uso para..." },
  { id: "desenvolvimento", title: "Desenvolvimento", range: "o corpo do vídeo", target: [30, 600], hint: "Os pontos principais, um de cada vez. Use frases curtas.", placeholder: "Primeiro ponto... Segundo ponto... Terceiro ponto..." },
  { id: "climax", title: "Clímax", range: "o ponto mais forte", target: [10, 60], hint: "A revelação, o resultado ou a virada que a pessoa esperou.", placeholder: "E aqui está o resultado: ..." },
  { id: "cta", title: "Chamada final (CTA)", range: "últimos segundos", target: [5, 20], hint: "Um único convite: o próximo vídeo, a inscrição ou um comentário.", placeholder: "Se isso ajudou, o próximo vídeo é a continuação. Está logo aqui do lado." },
];

export function blockStatus(block: ScriptBlock, seconds: number, words: number): { kind: "empty" | "short" | "ok" | "long"; msg: string } {
  if (!words) return { kind: "empty", msg: "" };
  if (seconds < block.target[0]) return { kind: "short", msg: `Curto para este bloco (ideal: ${block.target[0]} a ${block.target[1]} s).` };
  if (seconds > block.target[1]) return { kind: "long", msg: `Longo para este bloco (ideal: ${block.target[0]} a ${block.target[1]} s). Tente enxugar.` };
  return { kind: "ok", msg: "Duração boa para este bloco." };
}

// =====================================================================
// 6. Checklist de lançamento gamificado
// =====================================================================
export type LaunchGroup = { id: string; title: string; items: { id: string; text: string }[] };

export const LAUNCH_GROUPS: LaunchGroup[] = [
  {
    id: "titulo",
    title: "Título e miniatura",
    items: [
      { id: "titulo-claro", text: "O título é claro e as palavras mais importantes estão no começo" },
      { id: "miniatura", text: "A miniatura é legível no celular (texto grande e poucas palavras)" },
      { id: "miniatura-titulo", text: "A miniatura e o título se completam, sem repetir a mesma frase" },
    ],
  },
  {
    id: "descricao",
    title: "Descrição e tags",
    items: [
      { id: "mini-descricao", text: "A mini-descrição (as duas primeiras linhas) resume o vídeo" },
      { id: "capitulos", text: "Os capítulos estão na descrição" },
      { id: "tags", text: "As tags foram adicionadas" },
      { id: "hashtags", text: "As hashtags (até 3) foram escolhidas" },
    ],
  },
  {
    id: "alcance",
    title: "Legendas, tela final e cards",
    items: [
      { id: "legendas", text: "As legendas foram enviadas e revisadas" },
      { id: "tela-final", text: "A tela final aponta para o próximo vídeo ou para uma playlist" },
      { id: "cards", text: "Os cards foram colocados nos momentos certos" },
    ],
  },
  {
    id: "qualidade",
    title: "Qualidade e publicação",
    items: [
      { id: "audio", text: "O volume e a qualidade do áudio foram conferidos" },
      { id: "assistido", text: "O vídeo foi assistido do começo ao fim, sem erros" },
      { id: "publico", text: "O público (feito para crianças ou não) está marcado" },
      { id: "agendado", text: "A data e a hora de publicação foram escolhidas" },
    ],
  },
];

export const LAUNCH_ITEM_COUNT = LAUNCH_GROUPS.reduce((n, g) => n + g.items.length, 0);
export const XP_PER_ITEM = 10;

export const LAUNCH_LEVELS = [
  { min: 0, name: "Rascunho", msg: "Comece marcando o que já está pronto." },
  { min: 25, name: "Aquecendo", msg: "Bom começo. Continue." },
  { min: 50, name: "Quase lá", msg: "Mais da metade conferida." },
  { min: 80, name: "Pronto para decolar", msg: "Falta muito pouco." },
  { min: 100, name: "Lançamento perfeito", msg: "Tudo conferido. Pode publicar." },
];

export function launchLevel(pct: number) {
  let cur = LAUNCH_LEVELS[0];
  for (const l of LAUNCH_LEVELS) if (pct >= l.min) cur = l;
  const idx = LAUNCH_LEVELS.indexOf(cur);
  return { ...cur, index: idx, next: LAUNCH_LEVELS[idx + 1] ?? null };
}
