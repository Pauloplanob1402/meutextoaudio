// Funções puras das ferramentas extras (sem tela, fáceis de testar).
import { DEFAULT_PAUSE, estimateSeconds, parseScript } from "./tts";

// ---------- texto básico ----------
export const stripAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export const countWords = (s: string) => (s.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;

// Tempo de fala: palavras / ritmo + pausas [PAUSA - X segundos] escritas no texto
export function speechSeconds(raw: string, wpm: number) {
  let pause = 0;
  const text = raw
    .replace(/\[\s*PAUSA([^\]]*)\]/gi, (_m, n: string) => {
      const m = n.match(/(\d+(?:[.,]\d+)?)/);
      pause += m ? parseFloat(m[1].replace(",", ".")) : DEFAULT_PAUSE;
      return " ";
    })
    .replace(/\[[^\]]*\]/g, " ");
  const words = countWords(text);
  return { words, chars: text.trim().length, pause, seconds: (words / Math.max(wpm, 1)) * 60 + pause };
}

// Quebra um trecho longo em pedaços de no máximo `max` caracteres (prefere vírgula, depois espaço)
export function breakLong(s: string, max: number): string[] {
  const out: string[] = [];
  let rest = s.trim();
  while (rest.length > max) {
    let cut = rest.lastIndexOf(", ", max - 1);
    if (cut > max * 0.4) cut += 1;
    else {
      cut = rest.lastIndexOf(" ", max);
      if (cut < max * 0.4) cut = max;
    }
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}

// ---------- dividir em blocos ----------
export function splitBlocks(text: string, max = 1000): string[] {
  const clean = text.replace(/\r/g, "").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?\n]+[.!?]*\s*/g) ?? [clean];
  const units = sentences.flatMap((s) => (s.length > max ? breakLong(s, max) : [s]));
  const blocks: string[] = [];
  let cur = "";
  for (const u of units) {
    if (cur && (cur + u).length > max) {
      blocks.push(cur.trim());
      cur = u;
    } else cur += u;
  }
  if (cur.trim()) blocks.push(cur.trim());
  return blocks.filter(Boolean);
}

// ---------- hashtags e tags ----------
const keywordsOf = (input: string) =>
  input.split(/[,\n;]+/).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);

export function makeHashtags(input: string, opts: { noAccents?: boolean; max?: number } = {}): string[] {
  const out = new Set<string>();
  for (const k of keywordsOf(input)) {
    const base = opts.noAccents ? stripAccents(k) : k;
    const words = base.replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    out.add("#" + words.map((w) => w[0].toUpperCase() + w.slice(1)).join(""));
  }
  return [...out].slice(0, opts.max ?? 30);
}

// Tags do YouTube: cada palavra-chave, mais a versão sem acento quando for diferente
export function makeTags(input: string): string[] {
  const out = new Set<string>();
  for (const k of keywordsOf(input)) {
    out.add(k.toLowerCase());
    const plain = stripAccents(k.toLowerCase());
    if (plain !== k.toLowerCase()) out.add(plain);
  }
  return [...out];
}
export const tagsLength = (tags: string[]) => tags.join(",").length;

// ---------- horários, capítulos e legendas ----------
export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const ss = String(r).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

const TIME_LINE = /^\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.,]\d{1,3})?\s*(?:[-–—:.)\]]\s*)?(.*)$/;
export function parseTimeLine(line: string): { sec: number; text: string } | null {
  const m = line.match(TIME_LINE);
  if (!m) return null;
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const min = parseInt(m[2], 10);
  const s = parseInt(m[3], 10);
  if (s > 59 || (h && min > 59)) return null;
  return { sec: h * 3600 + min * 60 + s, text: m[4].trim() };
}

export function parseChapters(raw: string) {
  const items: { sec: number; title: string }[] = [];
  const problems: string[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const p = parseTimeLine(line);
    if (!p) {
      problems.push(`Esta linha não começa com um horário: "${line.trim().slice(0, 40)}"`);
      continue;
    }
    if (!p.text) problems.push(`Falta o título do capítulo que começa em ${fmtTime(p.sec)}.`);
    items.push({ sec: p.sec, title: p.text });
  }
  if (items.length) {
    if (items[0].sec !== 0) problems.push("O primeiro capítulo precisa começar em 0:00.");
    if (items.length < 3) problems.push("O YouTube pede pelo menos 3 capítulos.");
    for (let i = 1; i < items.length; i++) {
      if (items[i].sec <= items[i - 1].sec) problems.push(`Os horários precisam ir em ordem crescente (veja ${fmtTime(items[i].sec)}).`);
      else if (items[i].sec - items[i - 1].sec < 10) problems.push(`Cada capítulo precisa ter pelo menos 10 segundos (veja o que começa em ${fmtTime(items[i - 1].sec)}).`);
    }
  }
  return { items, problems, output: items.map((i) => `${fmtTime(i.sec)} ${i.title}`.trim()).join("\n") };
}

const srtTime = (sec: number) => {
  const ms = Math.round(Math.max(0, sec) * 1000);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(Math.floor((ms % 60000) / 1000))},${p(ms % 1000, 3)}`;
};

function wrapLines(s: string, width = 42): string {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > width) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines.join("\n");
}

type Cue = { start: number; end: number; text: string };
const toSrt = (cues: Cue[]) => cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join("\n");

// Legenda: com horários no texto ("0:05 Olá") usa os seus horários;
// sem horários, distribui o texto pela duração (estimada ou informada por você).
export function buildSrt(raw: string, totalSec?: number) {
  const lines = raw.replace(/\r/g, "").split("\n");
  const timed = lines.filter((l) => parseTimeLine(l)).length;

  if (timed >= 2) {
    const starts: { start: number; text: string }[] = [];
    for (const l of lines) {
      const p = parseTimeLine(l);
      if (p) starts.push({ start: p.sec, text: p.text });
      else if (l.trim() && starts.length) starts[starts.length - 1].text += (starts[starts.length - 1].text ? " " : "") + l.trim();
    }
    const cues: Cue[] = starts
      .filter((c) => c.text)
      .map((c, i, a) => ({
        start: c.start,
        end: i < a.length - 1 ? Math.max(a[i + 1].start, c.start + 0.5) : c.start + Math.min(6, Math.max(2, countWords(c.text) * 0.4)),
        text: wrapLines(c.text),
      }));
    return { srt: toSrt(cues), count: cues.length, mode: "tempos" as const, total: cues.length ? cues[cues.length - 1].end : 0 };
  }

  // modo automático
  type Piece = { text: string } | { pause: number };
  const pieces: Piece[] = [];
  for (const part of parseScript(raw)) {
    if (part.kind === "pause") pieces.push({ pause: part.seconds });
    else for (const p of breakLong(part.text, 84)) pieces.push({ text: wrapLines(p) });
  }
  const chars = pieces.reduce((n, p) => n + ("text" in p ? p.text.replace(/\s/g, "").length : 0), 0);
  const pauses = pieces.reduce((n, p) => n + ("pause" in p ? p.pause : 0), 0);
  if (!chars) return { srt: "", count: 0, mode: "automatico" as const, total: 0 };
  const total = totalSec && totalSec > 0 ? totalSec : estimateSeconds(raw, 1);
  const speech = Math.max(total - pauses, chars * 0.03);
  const perChar = speech / chars;

  const cues: Cue[] = [];
  let t = 0;
  for (const p of pieces) {
    if ("pause" in p) t += p.pause;
    else {
      const d = p.text.replace(/\s/g, "").length * perChar;
      cues.push({ start: t, end: t + d, text: p.text });
      t += d;
    }
  }
  return { srt: toSrt(cues), count: cues.length, mode: "automatico" as const, total: t };
}

// Lê "3:20", "1:05:00" ou "200" (segundos) e devolve segundos
export function parseDuration(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  if (/^\d+(?:[.,]\d+)?$/.test(t)) return parseFloat(t.replace(",", "."));
  const p = parseTimeLine(t);
  return p && !p.text ? p.sec : null;
}

// ---------- áudio: remover silêncio ----------
export function removeSilence(x: Float32Array, rate: number, o: { thresholdDb: number; minSilenceMs: number; keepMs: number }) {
  const win = Math.max(1, Math.round(rate * 0.01)); // janelas de 10 ms
  const n = Math.ceil(x.length / win);
  const thr = Math.pow(10, o.thresholdDb / 20);
  const silent = new Uint8Array(n);
  for (let w = 0; w < n; w++) {
    const s = w * win;
    const e = Math.min(x.length, s + win);
    let sum = 0;
    for (let i = s; i < e; i++) sum += x[i] * x[i];
    silent[w] = Math.sqrt(sum / Math.max(1, e - s)) < thr ? 1 : 0;
  }
  const minWin = Math.max(1, Math.round(o.minSilenceMs / 10));
  const keepWin = Math.min(Math.round(o.keepMs / 10), minWin);

  const keep = new Uint8Array(n).fill(1);
  for (let w = 0; w < n; ) {
    if (!silent[w]) {
      w++;
      continue;
    }
    let e = w;
    while (e < n && silent[e]) e++;
    if (e - w >= minWin) for (let k = w + keepWin; k < e; k++) keep[k] = 0;
    w = e;
  }

  let len = 0;
  for (let w = 0; w < n; w++) if (keep[w]) len += Math.min(win, x.length - w * win);
  const out = new Float32Array(len);
  let o2 = 0;
  for (let w = 0; w < n; w++) {
    if (!keep[w]) continue;
    const s = w * win;
    const e = Math.min(x.length, s + win);
    out.set(x.subarray(s, e), o2);
    o2 += e - s;
  }
  return { out, removedSec: (x.length - len) / rate };
}

export function float32ToInt16(f: Float32Array): Int16Array {
  const o = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const v = Math.max(-1, Math.min(1, f[i]));
    o[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
  }
  return o;
}

// WAV mono, 16 bits (o mesmo formato que o app já usa)
export function makeWavBlob(pcm: Int16Array, rate: number): Blob {
  const h = new ArrayBuffer(44);
  const v = new DataView(h);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  v.setUint32(4, 36 + pcm.byteLength, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, pcm.byteLength, true);
  return new Blob([h, pcm.buffer as ArrayBuffer], { type: "audio/wav" });
}
