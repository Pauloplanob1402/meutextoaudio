// Gerador de títulos: modelos de estrutura escritos para o Saium.
// Cada modelo pede só as lacunas que precisa, e cada lacuna tem um formato fixo
// (verbo no infinitivo, substantivo, plural...) para a frase sair natural.
import { titleFit } from "./toolkit2";

export type TitleInputs = {
  acao: string; // verbo no infinitivo + complemento: "gravar narração em casa"
  assunto: string; // substantivo: "narração em casa"
  publico: string; // plural: "iniciantes"
  resultado: string; // "em 10 minutos"
  sem: string; // "sem gastar com equipamento"
  n: number;
};

export const EMPTY_INPUTS: TitleInputs = { acao: "", assunto: "", publico: "", resultado: "", sem: "", n: 5 };
export const EXAMPLE_INPUTS: TitleInputs = { acao: "gravar narração em casa", assunto: "narração em casa", publico: "iniciantes", resultado: "em 10 minutos", sem: "sem gastar com equipamento", n: 5 };

type Slot = "acao" | "assunto" | "publico";
type Ctx = TitleInputs & { cap: (s: string) => string; r: string; s: string };
export type Technique = { id: string; name: string; trigger: string; why: string };
type Formula = { id: string; technique: string; needs: Slot[]; build: (c: Ctx) => string };

export const TECHNIQUES: Technique[] = [
  { id: "curiosidade", name: "Curiosidade", trigger: "Curiosidade", why: "Deixa uma lacuna aberta: a pessoa clica para completar a informação." },
  { id: "lista", name: "Lista", trigger: "Clareza", why: "O número mostra o que vem pela frente e dá forma ao vídeo." },
  { id: "passo", name: "Passo a passo", trigger: "Benefício", why: "Promete um resultado concreto e diz como chegar lá." },
  { id: "alerta", name: "Alerta", trigger: "Atenção", why: "Chama a atenção para algo que a pessoa pode estar deixando passar." },
  { id: "prova", name: "Experiência", trigger: "Prova", why: "Uma experiência de verdade passa mais confiança do que uma promessa." },
  { id: "pergunta", name: "Pergunta", trigger: "Envolvimento", why: "Uma pergunta puxa a pessoa para dentro do assunto e pede uma resposta." },
  { id: "novidade", name: "Novidade", trigger: "Novidade", why: "O que é novo ou mudou desperta interesse de quem quer se atualizar." },
];

const F: Formula[] = [
  // Curiosidade
  { id: "c1", technique: "curiosidade", needs: ["assunto"], build: (c) => `O que ninguém te conta sobre ${c.assunto}` },
  { id: "c2", technique: "curiosidade", needs: ["acao"], build: (c) => `O erro silencioso que faz muita gente desistir de ${c.acao}` },
  { id: "c3", technique: "curiosidade", needs: ["assunto"], build: (c) => `A verdade sobre ${c.assunto}` },
  { id: "c4", technique: "curiosidade", needs: ["acao"], build: (c) => `Eu não sabia disso antes de ${c.acao}` },
  // Lista
  { id: "l1", technique: "lista", needs: ["acao"], build: (c) => `${c.n} erros comuns ao ${c.acao}` },
  { id: "l2", technique: "lista", needs: ["acao"], build: (c) => `${c.n} passos simples para ${c.acao}${c.r}` },
  { id: "l3", technique: "lista", needs: ["assunto"], build: (c) => `${c.n} mitos sobre ${c.assunto} (e o que é verdade)` },
  { id: "l4", technique: "lista", needs: ["acao"], build: (c) => `${c.n} dicas para ${c.acao}${c.s}` },
  { id: "l5", technique: "lista", needs: ["assunto", "publico"], build: (c) => `${c.n} coisas que ${c.publico} precisam saber sobre ${c.assunto}` },
  // Passo a passo
  { id: "p1", technique: "passo", needs: ["acao"], build: (c) => `Como ${c.acao}${c.r}${c.s}` },
  { id: "p2", technique: "passo", needs: ["acao"], build: (c) => `O jeito mais simples de ${c.acao}` },
  { id: "p3", technique: "passo", needs: ["assunto", "publico"], build: (c) => `Guia completo de ${c.assunto} para ${c.publico}` },
  { id: "p4", technique: "passo", needs: ["assunto", "publico"], build: (c) => `${c.cap(c.assunto)} para ${c.publico}: por onde começar` },
  { id: "p5", technique: "passo", needs: ["acao"], build: (c) => `Como eu aprendi a ${c.acao}${c.r}` },
  // Alerta
  { id: "a1", technique: "alerta", needs: ["acao"], build: (c) => `Antes de ${c.acao}, assista a este vídeo` },
  { id: "a2", technique: "alerta", needs: ["assunto"], build: (c) => `${c.cap(c.assunto)}: o que fazer e o que evitar` },
  { id: "a3", technique: "alerta", needs: ["publico"], build: (c) => `Atenção, ${c.publico}: este vídeo é para vocês` },
  // Experiência
  { id: "e1", technique: "prova", needs: ["acao"], build: (c) => `Tentei ${c.acao} por ${c.n} dias: veja o que aconteceu` },
  { id: "e2", technique: "prova", needs: ["acao"], build: (c) => `Testei ${c.n} jeitos de ${c.acao}: este foi o melhor` },
  { id: "e3", technique: "prova", needs: ["acao"], build: (c) => `${c.cap(c.acao)} do zero: o que funcionou de verdade` },
  // Pergunta
  { id: "q1", technique: "pergunta", needs: ["acao"], build: (c) => `Você sabe ${c.acao} do jeito certo?` },
  { id: "q2", technique: "pergunta", needs: ["acao"], build: (c) => `Será que vale a pena ${c.acao}?` },
  { id: "q3", technique: "pergunta", needs: ["acao"], build: (c) => `Você comete estes erros ao ${c.acao}?` },
  // Novidade
  { id: "n1", technique: "novidade", needs: ["acao"], build: (c) => `Um jeito novo de ${c.acao}: vale a pena?` },
  { id: "n2", technique: "novidade", needs: ["assunto"], build: (c) => `${c.cap(c.assunto)}: o que mudou e o que continua igual` },
];

const clean = (s: string) => s.replace(/\s+/g, " ").trim().replace(/[.!?:;,]+$/, "").trim();
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export type GeneratedTitle = { id: string; technique: string; text: string };

export function generateTitles(input: TitleInputs) {
  const i: TitleInputs = {
    acao: clean(input.acao), assunto: clean(input.assunto), publico: clean(input.publico),
    resultado: clean(input.resultado), sem: clean(input.sem),
    n: Math.min(15, Math.max(2, Math.round(input.n) || 5)),
  };
  const c: Ctx = { ...i, cap, r: i.resultado ? ` ${i.resultado}` : "", s: i.sem ? ` ${i.sem}` : "" };
  const has: Record<Slot, boolean> = { acao: !!i.acao, assunto: !!i.assunto, publico: !!i.publico };

  const titles: GeneratedTitle[] = [];
  let locked = 0;
  for (const f of F) {
    if (f.needs.every((s) => has[s])) titles.push({ id: f.id, technique: f.technique, text: cap(f.build(c)) });
    else locked++;
  }
  return { titles, locked, filled: has };
}

// ---- cuidado com promessas que o vídeo não pode cumprir ----
const MONEY = /dinheiro|renda\b|lucr|ganh|rico|milh[ãa]o|investi|bolsa|fortuna|r\$/i;
const HEALTH = /sa[úu]de|doen[çc]|c[âa]ncer|\bcura|curar|emagrec|sintoma|diabet|hipertens|depress|ansiedade|rem[ée]dio|dieta/i;
const ABSOLUTE = /garantid|100\s?%|milagr|sem esfor[çc]o/i;

export function riskNotes(input: TitleInputs): string[] {
  const all = [input.acao, input.assunto, input.publico, input.resultado, input.sem].join(" ");
  const notes: string[] = [];
  if (MONEY.test(all)) notes.push("Assunto de dinheiro: não prometa ganhos que o vídeo não consiga comprovar. Mostre as fontes e deixe claro o que é experiência pessoal.");
  if (HEALTH.test(all)) notes.push("Assunto de saúde: não prometa cura nem resultado e não substitua a orientação de um profissional. Confira as informações em fontes confiáveis.");
  if (ABSOLUTE.test(all)) notes.push("Palavras como “garantido” e “100%” são promessas fortes. Só use se o vídeo puder provar.");
  return notes;
}

export const fitOf = titleFit;
