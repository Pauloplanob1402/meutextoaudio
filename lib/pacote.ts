// Pacote do vídeo: transforma o áudio gerado em legenda (.srt) e capítulos com os TEMPOS REAIS.
// Nada aqui altera o áudio nem o motor de voz: só mede e calcula, tudo no navegador.
import { cleanForTTS, hasSpeakable, splitText } from "@/lib/tts";
import { fmtTime, parseChapters } from "@/lib/toolkit";

// Para desligar: NEXT_PUBLIC_PACOTE=0 na Vercel e publicar de novo.
export const PACOTE_ON = process.env.NEXT_PUBLIC_PACOTE !== "0";

// Um trecho falado: idx é a posição do trecho de texto no roteiro; start/end em segundos, na velocidade original.
export type Cue = { idx: number; text: string; start: number; end: number };

// Mede a duração de cada trecho de áudio (do mesmo jeito que a montagem final decodifica).
export function createMeter() {
  const ctx = new AudioContext();
  return {
    async measure(b: Blob): Promise<number> {
      const buf = await ctx.decodeAudioData(await b.arrayBuffer());
      return buf.duration;
    },
    close() {
      ctx.close().catch(() => {});
    },
  };
}

/* ---------- texto original de cada trecho (com $, %, etc., que a voz não recebe) ---------- */

// Repete o caminho do parseScript, mas guarda o texto SEM a limpeza da voz, para a legenda sair fiel ao roteiro.
export function originalChunks(raw: string): string[] {
  const out: string[] = [];
  const pushText = (t: string) => {
    const clean = t.replace(/\[[^\]]*\]/g, "");
    clean
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .forEach((p) => {
        splitText(p, 500).forEach((c) => {
          if (!hasSpeakable(cleanForTTS(c))) return;
          out.push(c);
        });
      });
  };
  const re = /\[\s*PAUSA([^\]]*)\]/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    pushText(raw.slice(last, m.index));
    last = m.index + m[0].length;
  }
  pushText(raw.slice(last));
  return out;
}

/* ---------- legenda ---------- */

const MAX_LINE = 42; // caracteres por linha
const MAX_BLOCK = 80; // limite de texto por legenda (cabe em duas linhas de até 42)

const LETTERS = /[A-Za-z0-9\u00C0-\u00FF]/g;
// "peso" de um texto na fala: letras + um respiro para pontuação
const weight = (s: string) =>
  Math.max(1, (s.match(LETTERS) ?? []).length + 4 * (s.match(/[.!?…]/g) ?? []).length + 2 * (s.match(/[,;:]/g) ?? []).length);

function sentenceList(t: string): string[] {
  const out: string[] = [];
  let cur = "";
  for (let i = 0; i < t.length; i++) {
    cur += t[i];
    if (".!?…".includes(t[i])) {
      while (i + 1 < t.length && "\"')]".includes(t[i + 1])) cur += t[++i];
      // só fecha a frase se vier espaço ou o fim (assim "39.90" não é cortado)
      if (i + 1 >= t.length || /\s/.test(t[i + 1])) {
        out.push(cur.trim());
        cur = "";
      }
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

function packWords(words: string[], max: number): string[] {
  const res: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > max) {
      res.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) res.push(cur);
  return res;
}

// Corta depois de vírgula, ponto e vírgula ou dois-pontos seguidos de espaço (sem usar recursos que navegadores antigos não têm).
function splitClauses(s: string): string[] {
  const out: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    cur += s[i];
    if (",;:".includes(s[i]) && i + 1 < s.length && /\s/.test(s[i + 1])) {
      out.push(cur.trim());
      cur = "";
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

function breakLong(s: string): string[] {
  if (s.length <= MAX_BLOCK) return [s];
  const clauses = splitClauses(s);
  const out: string[] = [];
  let cur = "";
  for (const c of clauses) {
    if (c.length > MAX_BLOCK) {
      if (cur) { out.push(cur); cur = ""; }
      out.push(...packWords(c.split(/\s+/), MAX_BLOCK));
    } else if (cur && (cur + " " + c).length > MAX_BLOCK) {
      out.push(cur);
      cur = c;
    } else cur = cur ? cur + " " + c : c;
  }
  if (cur) out.push(cur);
  return out;
}

function pieces(text: string): string[] {
  const res: string[] = [];
  let cur = "";
  for (const s of sentenceList(text)) {
    for (const part of breakLong(s)) {
      if (cur && (cur + " " + part).length > MAX_BLOCK) {
        res.push(cur);
        cur = part;
      } else cur = cur ? cur + " " + part : part;
    }
  }
  if (cur) res.push(cur);
  return res;
}

// Quebra um trecho em linhas de até 42 caracteres. Se não houver um ponto de quebra que caiba em 2 linhas,
// divide em duas legendas (cada uma com a sua parte do tempo), em vez de passar do limite.
function wrap(p: string): string[] {
  if (p.length <= MAX_LINE) return [p];
  let best = -1;
  let bestMax = Infinity;
  for (let i = 0; i < p.length; i++) {
    if (p[i] !== " ") continue;
    const m = Math.max(i, p.length - i - 1);
    if (m < bestMax) { bestMax = m; best = i; }
  }
  if (best < 0) return [p];
  const a = p.slice(0, best);
  const b = p.slice(best + 1);
  return bestMax <= MAX_LINE ? [a + "\n" + b] : [...wrap(a), ...wrap(b)];
}

const pad = (n: number, l = 2) => String(n).padStart(l, "0");
export function srtTime(sec: number): string {
  const ms = Math.max(0, Math.round(sec * 1000));
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor((ms % 3600000) / 60000))}:${pad(Math.floor((ms % 60000) / 1000))},${pad(ms % 1000, 3)}`;
}

type Block = { start: number; end: number; text: string };

export function cuesToBlocks(cues: Cue[], texts: string[], factor = 1): Block[] {
  const f = factor > 0 ? factor : 1;
  const blocks: Block[] = [];
  cues.forEach((c, i) => {
    const ps = pieces(texts[i]).flatMap(wrap);
    if (!ps.length) return;
    const ws = ps.map(weight);
    const sum = ws.reduce((a, b) => a + b, 0);
    const s0 = c.start / f;
    const span = (c.end - c.start) / f;
    let cursor = s0;
    ps.forEach((p, k) => {
      const d = (span * ws[k]) / sum;
      blocks.push({ start: cursor, end: cursor + d, text: p });
      cursor += d;
    });
  });
  // legenda curta demais fica ilegível: estica até 1 s quando há espaço (nunca invade a próxima)
  blocks.forEach((b, i) => {
    const next = i + 1 < blocks.length ? blocks[i + 1].start : Infinity;
    const want = Math.min(b.start + 1, next);
    if (b.end < want) b.end = want;
  });
  return blocks;
}

export function blocksToSrt(blocks: Block[]): string {
  return blocks.map((b, i) => `${i + 1}\n${srtTime(b.start)} --> ${srtTime(b.end)}\n${b.text}\n`).join("\n");
}

/* ---------- capítulos ---------- */

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function wordsOf(s: string): { w: string; at: number }[] {
  const out: { w: string; at: number }[] = [];
  const re = /[A-Za-z0-9\u00C0-\u00FF]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) out.push({ w: fold(m[0]), at: m.index });
  return out;
}

// Marcas do roteiro: [CAPÍTULO: Título]. Elas não são lidas em voz alta (os colchetes são apagados antes da fala).
export function extractMarks(raw: string): { title: string; anchor: string[] }[] {
  const re = /\[\s*CAP[IÍ]TULO\s*[:\-–]?\s*([^\]]*)\]/gi;
  const found: { title: string; end: number; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) found.push({ title: m[1].replace(/\s+/g, " ").trim().slice(0, 80), start: m.index, end: m.index + m[0].length });
  return found.map((f, i) => {
    const after = raw.slice(f.end, i + 1 < found.length ? found[i + 1].start : raw.length).replace(/\[[^\]]*\]/g, " ");
    return { title: f.title, anchor: wordsOf(after).slice(0, 5).map((x) => x.w) };
  });
}

export type Pacote = {
  srt: string;
  count: number;
  total: number; // fim da última legenda, em segundos
  preview: string;
  chapters: { marks: number; output: string; problems: string[] };
};

export function buildPackage(cues: Cue[], raw: string, factor = 1): Pacote {
  const f = factor > 0 ? factor : 1;
  const orig = originalChunks(raw);
  const textOf = (c: Cue) => {
    const o = orig[c.idx];
    return o && cleanForTTS(o) === c.text ? o : c.text; // só usa o original se for o mesmo trecho
  };
  const texts = cues.map(textOf);
  const blocks = cuesToBlocks(cues, texts, f);
  const srt = blocksToSrt(blocks);
  const preview = blocksToSrt(blocks.slice(0, 3));

  // capítulos
  const marks = extractMarks(raw);
  const problems: string[] = [];
  const times: { sec: number; title: string }[] = [];
  let from = 0;
  for (const mk of marks) {
    if (!mk.title) { problems.push("Há um [CAPÍTULO] sem título."); continue; }
    if (!mk.anchor.length) { problems.push(`O capítulo "${mk.title}" não tem texto depois da marca.`); continue; }
    let hit: number | null = null;
    for (let j = from; j < cues.length && hit === null; j++) {
      const ws = wordsOf(texts[j]);
      for (let i = 0; i + mk.anchor.length <= ws.length; i++) {
        if (mk.anchor.every((a, k) => ws[i + k].w === a)) {
          const frac = i === 0 ? 0 : weight(texts[j].slice(0, ws[i].at)) / weight(texts[j]);
          hit = cues[j].start + (cues[j].end - cues[j].start) * Math.min(1, frac);
          from = j;
          break;
        }
      }
    }
    if (hit === null) problems.push(`Não encontrei no áudio o ponto do capítulo "${mk.title}".`);
    else times.push({ sec: hit / f, title: mk.title });
  }
  let output = "";
  if (times.length) {
    if (times[0].sec > 1) times.unshift({ sec: 0, title: "Introdução" });
    else times[0].sec = 0;
    const lines = times.map((t) => `${fmtTime(t.sec)} ${t.title}`).join("\n");
    const v = parseChapters(lines);
    output = v.output;
    problems.push(...v.problems);
  }
  return { srt, count: blocks.length, total: blocks.length ? blocks[blocks.length - 1].end : 0, preview, chapters: { marks: marks.length, output, problems } };
}
