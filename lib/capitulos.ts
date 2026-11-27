// Audiolivro e podcast em lote: divide um texto longo em capítulos e dá nome organizado a cada arquivo. Sem IA.
import { countWords } from "./toolkit";

export type Chapter = { title: string; text: string };
export type SplitMode = "auto" | "size";
export const MAX_CHAPTERS = 60;
export const MAX_CHARS = 300_000;

const HEADING = /^\s*(#{1,3}\s+\S.*|(cap[ií]tulo|parte|epis[oó]dio|aula|m[oó]dulo|se[cç][aã]o|prefácio|prefacio|introdução|introducao|conclusão|conclusao|epílogo|epilogo)\b.{0,80})\s*$/i;
const clean = (s: string) => s.replace(/^\s*#{1,3}\s+/, "").replace(/\s+/g, " ").trim();
const SEP = /^\s*-{3,}\s*$/;

export function slugify(s: string, max = 40): string {
  const t = s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return t.slice(0, max).replace(/-+$/g, "") || "capitulo";
}

export const fileName = (i: number, total: number, title: string, ext: string) =>
  `${String(i + 1).padStart(Math.max(2, String(total).length), "0")}-${slugify(title)}.${ext}`;

// Corta pelo tamanho, sempre no fim de um parágrafo. minutes = duração alvo de cada parte.
function bySize(text: string, minutes: number, wpm: number): Chapter[] {
  const target = Math.max(200, Math.round(minutes * wpm));
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const out: string[][] = [[]];
  let n = 0;
  for (const p of paras) {
    const w = countWords(p);
    if (n > 0 && n + w > target * 1.15) { out.push([]); n = 0; }
    out[out.length - 1].push(p);
    n += w;
  }
  return out.filter((c) => c.length).map((c, i) => ({ title: `Parte ${i + 1}`, text: c.join("\n\n") }));
}

export function splitChapters(raw: string, mode: SplitMode, opts: { minutes?: number; wpm?: number; speakTitle?: boolean } = {}): Chapter[] {
  const text = raw.replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  const { minutes = 10, wpm = 150, speakTitle = true } = opts;
  const lines = text.split("\n");

  // 1) separadores escritos pelo próprio autor (linha só com ---)
  if (mode === "auto" && lines.some((l) => SEP.test(l))) {
    const blocks = text.split(/^\s*-{3,}\s*$/m).map((b) => b.trim()).filter(Boolean);
    if (blocks.length >= 2) {
      return blocks.map((b, i) => {
        const first = b.split("\n")[0];
        if (HEADING.test(first) && b.split("\n").length > 1) {
          const title = clean(first);
          return { title, text: speakTitle ? b.replace(/^\s*#{1,3}\s+/, "") : b.split("\n").slice(1).join("\n").trim() };
        }
        return { title: `Parte ${i + 1}`, text: b };
      });
    }
  }

  // 2) títulos de capítulo ("Capítulo 1", "# Título"...)
  if (mode === "auto") {
    const idx: number[] = [];
    lines.forEach((l, i) => { if (HEADING.test(l) && l.trim().length <= 90) idx.push(i); });
    if (idx.length >= 2) {
      const chapters: Chapter[] = [];
      const pre = lines.slice(0, idx[0]).join("\n").trim();
      if (countWords(pre) >= 40) chapters.push({ title: "Introdução", text: pre });
      idx.forEach((start, k) => {
        const end = k + 1 < idx.length ? idx[k + 1] : lines.length;
        const title = clean(lines[start]);
        const body = lines.slice(start + 1, end).join("\n").trim();
        if (!body) return;
        chapters.push({ title, text: speakTitle ? `${title}.\n\n${body}` : body });
      });
      if (chapters.length >= 2) return chapters;
    }
  }

  // 3) por tamanho
  return bySize(text, minutes, wpm);
}

export function summaryTxt(items: { title: string; seconds: number; file: string }[]): string {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  let acc = 0;
  const rows = items.map((c, i) => {
    const line = `${String(i + 1).padStart(2, "0")}  ${fmt(acc)}  ${c.title}  (${fmt(c.seconds)})  ${c.file}`;
    acc += c.seconds;
    return line;
  });
  return ["Sumário (número, início se tocar em sequência, título, duração, arquivo)", "", ...rows, "", `Total: ${fmt(acc)}`, ""].join("\r\n");
}
