// Lógica do "sistema" do canal (sem IA, sem servidor): painel do vídeo, revisão, séries etc.
// Tudo é puro e roda no navegador. Os dados do usuário ficam no localStorage.

// =====================================================================
// Painel do vídeo (a esteira: da ideia à revisão)
// =====================================================================
export type Stage = {
  id: string;
  title: string;
  why: string;
  tasks: { id: string; text: string }[];
  notes: string; // pergunta da caixa de anotação
  tools: string[]; // slugs de /ferramentas (só aparecem se a ferramenta existir) ou "/" para a página inicial
};

export const STAGES: Stage[] = [
  {
    id: "ideia", title: "Ideia",
    why: "Um bom vídeo começa com uma pessoa e um problema, não com um assunto solto.",
    tasks: [
      { id: "publico", text: "Sei para quem é este vídeo" },
      { id: "problema", text: "Sei qual problema ou desejo ele resolve" },
      { id: "busca", text: "Procurei no YouTube e vi que existe gente buscando isso" },
    ],
    notes: "Descreva a ideia em uma frase: para quem é e o que a pessoa ganha.",
    tools: ["ideias-de-video", "gerador-de-titulos"],
  },
  {
    id: "titulo", title: "Título e miniatura",
    why: "É o que decide o clique. Defina antes de gravar, para o vídeo cumprir a promessa.",
    tasks: [
      { id: "t3", text: "Escrevi 3 opções de título" },
      { id: "tkey", text: "O título escolhido tem a palavra-chave no começo" },
      { id: "mini", text: "A miniatura tem texto curto e grande" },
      { id: "cel", text: "Testei título e miniatura no tamanho do celular" },
    ],
    notes: "Cole aqui o título escolhido e as outras opções.",
    tools: ["gerador-de-titulos", "simulador-de-ctr", "miniatura", "titulo-e-descricao"],
  },
  {
    id: "roteiro", title: "Roteiro",
    why: "Roteiro em blocos deixa o vídeo enxuto e evita enrolação.",
    tasks: [
      { id: "blocos", text: "Escrevi o roteiro em blocos (gancho, contexto, corpo, clímax, chamada final)" },
      { id: "tempo", text: "Conferi o tempo total falado" },
      { id: "corte", text: "Cortei o que não ajuda a promessa do título" },
    ],
    notes: "Duração alvo e pontos principais do vídeo.",
    tools: ["roteiro-em-blocos", "tempo-de-fala"],
  },
  {
    id: "gancho", title: "Gancho",
    why: "Os primeiros segundos decidem se a pessoa fica. Vale revisar só esta parte.",
    tasks: [
      { id: "curto", text: "O gancho tem até 5 a 8 segundos" },
      { id: "nota", text: "Conferi o gancho no validador e a nota ficou boa" },
      { id: "semintro", text: "Não começa com apresentação nem cumprimento" },
    ],
    notes: "Escreva aqui as primeiras frases do vídeo.",
    tools: ["validador-de-gancho"],
  },
  {
    id: "audio", title: "Áudio e edição",
    why: "Som limpo segura mais a audiência do que imagem bonita.",
    tasks: [
      { id: "audio", text: "Gravei ou gerei o áudio" },
      { id: "sil", text: "Tirei os silêncios longos" },
      { id: "edit", text: "Montei o vídeo" },
      { id: "rev", text: "Assisti do começo ao fim, sem erros" },
    ],
    notes: "Anotações de edição: o que ainda precisa ajustar.",
    tools: ["/", "remover-silencio", "dividir-texto"],
  },
  {
    id: "publicar", title: "Preparar a publicação",
    why: "Descrição, capítulos e legendas ajudam o YouTube a entender e a recomendar o vídeo.",
    tasks: [
      { id: "desc", text: "Escrevi a descrição (as 2 primeiras linhas resumem o vídeo)" },
      { id: "cap", text: "Coloquei os capítulos" },
      { id: "tags", text: "Adicionei tags e hashtags" },
      { id: "leg", text: "Enviei as legendas" },
      { id: "check", text: "Completei o checklist de lançamento" },
      { id: "agenda", text: "Agendei a data e a hora" },
    ],
    notes: "Rascunho da descrição ou links que vão nela.",
    tools: ["capitulos", "hashtags-e-tags", "legendas-srt", "checklist-de-publicacao", "calendario"],
  },
  {
    id: "no-ar", title: "No ar",
    why: "As primeiras 48 horas mostram como o público recebeu o vídeo.",
    tasks: [
      { id: "coment", text: "Respondi os primeiros comentários" },
      { id: "link", text: "Compartilhei o link nos meus canais" },
      { id: "anot", text: "Anotei a data e a hora em que o vídeo saiu" },
    ],
    notes: "Onde você divulgou e o que as pessoas disseram.",
    tools: [],
  },
  {
    id: "revisao", title: "Revisão",
    why: "Quem analisa cada vídeo melhora o próximo. É o que os grandes canais fazem sempre.",
    tasks: [
      { id: "nums", text: "Anotei os números (cliques, retenção, visualizações) depois de 7 dias" },
      { id: "fez", text: "Escrevi o que funcionou" },
      { id: "muda", text: "Escrevi o que vou mudar no próximo vídeo" },
    ],
    notes: "O que você aprendeu com este vídeo.",
    tools: ["revisao-do-video"],
  },
];

export type Video = {
  id: string;
  title: string;
  stage: number; // índice em STAGES
  checks: Record<string, string[]>; // etapa -> tarefas concluídas
  notes: Record<string, string>; // etapa -> anotação
  date?: string; // data de publicação (AAAA-MM-DD)
  done?: boolean;
  created: string; // AAAA-MM-DD
};

export const TOTAL_TASKS = STAGES.reduce((n, s) => n + s.tasks.length, 0);

export const newVideoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function newVideo(title: string, created: string): Video {
  return { id: newVideoId(), title: title.trim() || "Vídeo sem título", stage: 0, checks: {}, notes: {}, created };
}

export function doneTasks(v: Video): number {
  return STAGES.reduce((n, s) => n + (v.checks[s.id]?.filter((t) => s.tasks.some((x) => x.id === t)).length ?? 0), 0);
}

export function progressPct(v: Video): number {
  if (v.done) return 100;
  return Math.round((doneTasks(v) / TOTAL_TASKS) * 100);
}

export function stageDone(v: Video, i: number): boolean {
  const s = STAGES[i];
  return s.tasks.every((t) => v.checks[s.id]?.includes(t.id));
}

// Próxima tarefa que falta na etapa atual (ou null se a etapa está completa)
export function nextTask(v: Video): string | null {
  const s = STAGES[v.stage];
  return s.tasks.find((t) => !v.checks[s.id]?.includes(t.id))?.text ?? null;
}

// Resumo de todos os vídeos para o topo do painel
export function boardSummary(list: Video[]) {
  const active = list.filter((v) => !v.done);
  return { active: active.length, finished: list.length - active.length, inReview: active.filter((v) => v.stage === STAGES.length - 1).length };
}

// =====================================================================
// Revisão pós-publicação (números do YouTube Studio -> diagnóstico por regras)
// =====================================================================
export type ReviewInput = {
  views: number | null;
  ctr: number | null; // % de cliques nas impressões
  retention: number | null; // % média assistida
  ret30: number | null; // % que ainda assistia aos 30 s (opcional)
  likes: number | null;
  comments: number | null;
  subs: number | null; // inscritos ganhos
};

export type Level = "baixo" | "regular" | "bom" | "otimo";
export const LEVEL_LABEL: Record<Level, string> = { baixo: "Baixo", regular: "Regular", bom: "Bom", otimo: "Ótimo" };

// Faixas aproximadas. Variam por nicho e tamanho do canal: servem para comparar seus vídeos entre si.
const band = (v: number, cuts: [number, number, number]): Level => (v < cuts[0] ? "baixo" : v < cuts[1] ? "regular" : v < cuts[2] ? "bom" : "otimo");
export const ctrLevel = (v: number) => band(v, [2.5, 4.5, 8]);
export const retentionLevel = (v: number) => band(v, [30, 40, 50]);
export const ret30Level = (v: number) => band(v, [55, 70, 80]);
export const engagementLevel = (v: number) => band(v, [1.5, 3, 5]);
export const subsLevel = (v: number) => band(v, [1, 3, 6]);

export type Metric = { id: string; label: string; value: string; level: Level; area: string };
export type Review = {
  metrics: Metric[];
  verdict: { title: string; text: string };
  actions: { text: string; tool?: string }[];
  complete: boolean;
};

const fmt = (n: number, d = 1) => n.toLocaleString("pt-BR", { maximumFractionDigits: d });

export function reviewVideo(i: ReviewInput): Review {
  const metrics: Metric[] = [];
  const has = (n: number | null): n is number => n !== null && !Number.isNaN(n);

  if (has(i.ctr)) metrics.push({ id: "ctr", label: "Taxa de cliques (CTR)", value: `${fmt(i.ctr)}%`, level: ctrLevel(i.ctr), area: "título e miniatura" });
  if (has(i.retention)) metrics.push({ id: "ret", label: "Retenção média", value: `${fmt(i.retention)}%`, level: retentionLevel(i.retention), area: "roteiro e ritmo" });
  if (has(i.ret30)) metrics.push({ id: "r30", label: "Ainda assistindo aos 30 s", value: `${fmt(i.ret30)}%`, level: ret30Level(i.ret30), area: "gancho e contexto" });
  if (has(i.views) && i.views > 0) {
    if (has(i.likes) || has(i.comments)) {
      const e = (((i.likes ?? 0) + (i.comments ?? 0)) / i.views) * 100;
      metrics.push({ id: "eng", label: "Curtidas e comentários por visualização", value: `${fmt(e)}%`, level: engagementLevel(e), area: "chamada final" });
    }
    if (has(i.subs)) {
      const s = (i.subs / i.views) * 1000;
      metrics.push({ id: "subs", label: "Inscritos por mil visualizações", value: fmt(s), level: subsLevel(s), area: "convite para se inscrever" });
    }
  }

  const strong = (l?: Level) => l === "bom" || l === "otimo";
  const ctrL = metrics.find((m) => m.id === "ctr")?.level;
  const retL = metrics.find((m) => m.id === "ret")?.level;
  const r30L = metrics.find((m) => m.id === "r30")?.level;

  let verdict = { title: "Preencha ao menos a taxa de cliques e a retenção", text: "Com esses dois números dá para saber se o problema está na embalagem (título e miniatura) ou no conteúdo." };
  const actions: Review["actions"] = [];

  if (ctrL && retL) {
    if (strong(ctrL) && strong(retL)) {
      verdict = { title: "Repita a fórmula", text: "As pessoas clicam e ficam até o fim. Descubra o que este vídeo tem de especial e faça outro parecido." };
      actions.push({ text: "Faça uma sequência: mesmo tema ou formato, com um novo ângulo." });
      actions.push({ text: "Aproveite o título e a miniatura como modelo para os próximos.", tool: "gerador-de-titulos" });
    } else if (strong(ctrL) && !strong(retL)) {
      verdict = { title: "A promessa atrai, mas o vídeo não sustenta", text: "O título e a miniatura funcionam, mas as pessoas saem cedo. O ajuste está no conteúdo, não na embalagem." };
      actions.push({ text: "Reescreva o gancho: entregue a promessa do título logo nos primeiros segundos.", tool: "validador-de-gancho" });
      actions.push({ text: "Enxugue o roteiro: corte as partes que não levam ao que o título prometeu.", tool: "roteiro-em-blocos" });
    } else if (!strong(ctrL) && strong(retL)) {
      verdict = { title: "Bom vídeo, embalagem fraca", text: "Quem assiste gosta, mas poucos clicam. Vale trocar título e miniatura, o YouTube permite mudar depois de publicado." };
      actions.push({ text: "Teste um título novo com a palavra-chave no começo.", tool: "gerador-de-titulos" });
      actions.push({ text: "Refaça a miniatura com menos palavras e letra maior.", tool: "simulador-de-ctr" });
    } else {
      verdict = { title: "Reveja a ideia e o público", text: "Poucos clicaram e poucos ficaram. Provavelmente o tema não tem busca ou não ficou claro para quem é o vídeo." };
      actions.push({ text: "Volte à etapa da ideia: confirme que existe gente procurando esse assunto.", tool: "ideias-de-video" });
      actions.push({ text: "Defina uma pessoa específica para o próximo vídeo e escreva o gancho para ela.", tool: "validador-de-gancho" });
    }
  } else if (ctrL && !retL) {
    verdict = strong(ctrL)
      ? { title: "A embalagem está funcionando", text: "Falta a retenção para saber se o conteúdo também está." }
      : { title: "A embalagem precisa melhorar", text: "Poucas pessoas clicaram. Falta a retenção para saber se o conteúdo também precisa de ajuste." };
  } else if (retL && !ctrL) {
    verdict = { title: strong(retL) ? "O conteúdo está segurando" : "O conteúdo está perdendo gente", text: "Falta a taxa de cliques para saber se a embalagem também precisa de ajuste." };
  }

  if (r30L === "baixo" || r30L === "regular") actions.push({ text: "Muita gente sai nos primeiros 30 segundos: revise o gancho e o contexto.", tool: "validador-de-gancho" });
  const eng = metrics.find((m) => m.id === "eng");
  if (eng && (eng.level === "baixo" || eng.level === "regular")) actions.push({ text: "Pouca interação: termine com uma única pergunta ou convite claro para comentar." });
  const subs = metrics.find((m) => m.id === "subs");
  if (subs && subs.level === "baixo") actions.push({ text: "Poucos inscritos: avise por que vale se inscrever (a próxima série, o dia da semana em que você publica)." });

  return { metrics, verdict, actions: actions.slice(0, 5), complete: Boolean(ctrL && retL) };
}

export const trendOf = (now: number | null, before: number | null) =>
  now === null || before === null ? null : Math.abs(now - before) < 0.05 ? "igual" : now > before ? "subiu" : "caiu";

// =====================================================================
// Planejador de série (um tema vira uma grade de episódios com estrutura fixa)
// =====================================================================
type Role = { id: string; name: string; title: string; goal: string; hook: string };

// Ordem narrativa de uma série completa. Para menos episódios, escolhemos pontos espaçados desta lista.
const ROLES: Role[] = [
  { id: "piloto", name: "Visão geral", title: "{T}: por que isso importa e por onde começar", goal: "Mostrar o mapa da série e por que vale acompanhar.", hook: "Comece pelo resultado que a pessoa terá no final da série." },
  { id: "passo1", name: "Primeiro passo", title: "{T}: o primeiro passo que quase ninguém ensina direito", goal: "Dar uma vitória rápida para a pessoa não desistir.", hook: "Mostre algo que a pessoa consegue fazer ainda hoje." },
  { id: "erros", name: "Erros comuns", title: "Os erros mais comuns em {t} (e como evitar)", goal: "Poupar tempo e frustração de quem está começando.", hook: "Conte o erro que você mesmo cometeu e o que custou." },
  { id: "pratica", name: "Passo a passo", title: "{T} na prática: passo a passo completo", goal: "Entregar o método completo, em ordem.", hook: "Mostre o resultado pronto e volte ao começo para explicar." },
  { id: "recursos", name: "Ferramentas e recursos", title: "O que você precisa para {t}: ferramentas e recursos", goal: "Reunir o que usar, com opções grátis e pagas.", hook: "Diga quanto custa começar e como gastar menos." },
  { id: "caso", name: "Exemplo real", title: "{T} na vida real: um exemplo do começo ao fim", goal: "Provar que o método funciona com um caso concreto.", hook: "Comece pelo antes e pelo depois, em números ou imagens." },
  { id: "duvidas", name: "Perguntas do público", title: "Respondendo as dúvidas mais comuns sobre {t}", goal: "Responder o que o público perguntou nos vídeos anteriores.", hook: "Leia a pergunta mais curiosa dos comentários." },
  { id: "avancado", name: "Nível avançado", title: "{T} nível avançado: o que vem depois do básico", goal: "Levar quem já domina o básico para o próximo nível.", hook: "Diga o que separa o básico do avançado em uma frase." },
  { id: "mitos", name: "Mitos", title: "Mitos sobre {t} que você precisa esquecer", goal: "Derrubar crenças que atrapalham.", hook: "Comece pelo mito mais popular e diga que ele está errado." },
  { id: "comparar", name: "Comparativo", title: "{T}: comparando os caminhos possíveis", goal: "Ajudar a escolher entre as opções existentes.", hook: "Apresente as opções e prometa um veredito no final." },
  { id: "resultado", name: "Antes e depois", title: "Antes e depois: o que mudou com {t}", goal: "Mostrar a transformação ao longo da série.", hook: "Coloque lado a lado o começo e o resultado de agora." },
  { id: "final", name: "Fechamento", title: "{T}: o resumo de tudo e seus próximos passos", goal: "Reunir o que foi visto e apontar o que fazer depois.", hook: "Resuma a série inteira em 3 frases." },
];

export type Episode = { n: number; role: string; title: string; goal: string; hook: string; cta: string; date: string };
export type SeriesInput = { theme: string; count: number; startDate: string; perWeek: 1 | 2 | 3 | 7 };

const PATTERNS: Record<number, number[]> = { 1: [7], 2: [3, 4], 3: [2, 2, 3], 7: [1] };

const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

export const cap1 = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function planSeries(i: SeriesInput): Episode[] {
  const theme = i.theme.replace(/\s+/g, " ").trim();
  if (theme.length < 3) return [];
  const n = Math.min(12, Math.max(3, Math.round(i.count)));
  const picks = Array.from(new Set(Array.from({ length: n }, (_, k) => Math.round((k * (ROLES.length - 1)) / (n - 1)))));
  const T = cap1(theme);
  const sub = (s: string) => s.replace(/\{T\}/g, T).replace(/\{t\}/g, theme);
  const pat = PATTERNS[i.perWeek] ?? PATTERNS[1];
  let offset = 0;
  const eps: Episode[] = picks.map((idx, k) => {
    const r = ROLES[idx];
    const date = i.startDate ? addDays(i.startDate, offset) : "";
    offset += pat[k % pat.length];
    return { n: k + 1, role: r.name, title: sub(r.title), goal: r.goal, hook: r.hook, cta: "", date };
  });
  eps.forEach((e, k) => {
    e.cta = k < eps.length - 1
      ? `Feche chamando para o episódio ${k + 2}: "${eps[k + 1].title}".`
      : "Convide a pessoa a rever a série na playlist e a contar qual episódio mais ajudou.";
  });
  return eps;
}

export const seriesName = (theme: string) => `Série: ${cap1(theme.trim())}`;

export function seriesText(theme: string, eps: Episode[]): string {
  const br = (d: string) => (d ? d.split("-").reverse().join("/") : "sem data");
  const head = `${seriesName(theme)} (${eps.length} episódios)`;
  return [head, "=".repeat(head.length), "", ...eps.flatMap((e) => [`EPISÓDIO ${e.n} · ${e.role} · ${br(e.date)}`, e.title, `Objetivo: ${e.goal}`, `Gancho: ${e.hook}`, `Final: ${e.cta}`, ""])].join("\n");
}

// =====================================================================
// Desafio de 30 dias: uma missão por dia, 4 vídeos no ar
// =====================================================================
export type Mission = { day: number; text: string; tool?: string; publish?: boolean };

export const MISSIONS: Mission[] = [
  { day: 1, text: "Escreva, em uma frase, para quem é o seu canal e o que ele resolve.", tool: "dna-de-marca" },
  { day: 2, text: "Liste 3 assuntos que você domina e que as pessoas procuram.", tool: "ideias-de-video" },
  { day: 3, text: "Escreva 5 ideias de vídeo para a sua primeira série.", tool: "planejador-de-serie" },
  { day: 4, text: "Escolha a ideia número 1 e escreva 3 opções de título.", tool: "gerador-de-titulos" },
  { day: 5, text: "Faça a miniatura do primeiro vídeo e teste no tamanho do celular.", tool: "simulador-de-ctr" },
  { day: 6, text: "Escreva o gancho do primeiro vídeo e confira a nota.", tool: "validador-de-gancho" },
  { day: 7, text: "Escreva o roteiro completo em blocos.", tool: "roteiro-em-blocos" },
  { day: 8, text: "Gere ou grave o áudio e tire os silêncios longos.", tool: "remover-silencio" },
  { day: 9, text: "Edite o vídeo e assista do começo ao fim, sem pular nada.", tool: "painel-do-video" },
  { day: 10, text: "Prepare a descrição, os capítulos, as tags e as legendas.", tool: "capitulos" },
  { day: 11, text: "Publique o primeiro vídeo. Use o checklist antes de apertar o botão.", tool: "checklist-de-publicacao", publish: true },
  { day: 12, text: "Responda todos os comentários e compartilhe o link com 5 pessoas." },
  { day: 13, text: "Escolha o segundo vídeo da série e escreva título e gancho.", tool: "painel-do-video" },
  { day: 14, text: "Escreva o roteiro do segundo vídeo usando um playbook.", tool: "playbooks" },
  { day: 15, text: "Produza o áudio e edite o segundo vídeo." },
  { day: 16, text: "Publique o segundo vídeo.", tool: "checklist-de-publicacao", publish: true },
  { day: 17, text: "Faça a revisão do primeiro vídeo com os números da primeira semana.", tool: "revisao-do-video" },
  { day: 18, text: "Escreva três coisas que você vai mudar a partir do que aprendeu." },
  { day: 19, text: "Reescreva o gancho do terceiro vídeo usando esse aprendizado.", tool: "validador-de-gancho" },
  { day: 20, text: "Teste um título novo no vídeo que menos recebeu cliques.", tool: "simulador-de-ctr" },
  { day: 21, text: "Produza o terceiro vídeo, do roteiro à edição.", tool: "roteiro-em-blocos" },
  { day: 22, text: "Publique o terceiro vídeo.", tool: "checklist-de-publicacao", publish: true },
  { day: 23, text: "Monte o calendário do próximo mês com as datas de publicação.", tool: "calendario" },
  { day: 24, text: "Escolha um playbook novo para variar o formato do próximo vídeo.", tool: "playbooks" },
  { day: 25, text: "Assista a 2 vídeos de canais maiores do seu assunto e anote como começam (sem copiar)." },
  { day: 26, text: "Produza o quarto vídeo.", tool: "painel-do-video" },
  { day: 27, text: "Publique o quarto vídeo.", tool: "checklist-de-publicacao", publish: true },
  { day: 28, text: "Compare a revisão dos seus dois últimos vídeos e veja o que melhorou.", tool: "revisao-do-video" },
  { day: 29, text: "Planeje a sua próxima série completa.", tool: "planejador-de-serie" },
  { day: 30, text: "Escreva as 3 maiores lições dos 30 dias e o que vai repetir no próximo ciclo." },
];

export const PUBLISH_DAYS = MISSIONS.filter((m) => m.publish).map((m) => m.day);

const utc = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d); };

// Em que dia do desafio estamos (1 = primeiro dia; pode passar de 30 ou ser 0 antes do início)
export const dayNumber = (start: string, today: string) => Math.floor((utc(today) - utc(start)) / 86400000) + 1;

export type Badge = { id: string; name: string; desc: string; earned: boolean };

export function longestRun(done: number[]): number {
  const s = [...new Set(done)].sort((a, b) => a - b);
  let best = 0, cur = 0, prev = -9;
  for (const d of s) { cur = d === prev + 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; }
  return best;
}

// Sequência atual: dias seguidos concluídos terminando em hoje (ou ontem, se hoje ainda não foi feito)
export function currentStreak(done: number[], today: number): number {
  const set = new Set(done);
  let d = set.has(today) ? today : today - 1;
  let n = 0;
  while (d >= 1 && set.has(d)) { n++; d--; }
  return n;
}

export function challengeBadges(done: number[]): Badge[] {
  const set = new Set(done);
  const run = longestRun(done);
  return [
    { id: "inicio", name: "Primeiro passo", desc: "Concluiu a missão do dia 1.", earned: set.has(1) },
    { id: "ritmo", name: "Ritmo de 3 dias", desc: "3 dias seguidos concluídos.", earned: run >= 3 },
    { id: "semana", name: "Semana completa", desc: "7 dias seguidos concluídos.", earned: run >= 7 },
    { id: "no-ar", name: "Primeiro vídeo no ar", desc: "Publicou o primeiro vídeo.", earned: set.has(11) },
    { id: "metade", name: "Metade do caminho", desc: "15 missões concluídas.", earned: done.length >= 15 },
    { id: "serie", name: "Quatro vídeos publicados", desc: "Concluiu os 4 dias de publicação.", earned: PUBLISH_DAYS.every((d) => set.has(d)) },
    { id: "trinta", name: "30 dias", desc: "Concluiu as 30 missões.", earned: done.length >= 30 },
  ];
}
