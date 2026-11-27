// Vídeo narrado com legenda: lógica pura (sem tela). A imagem é desenhada em um canvas e gravada pelo navegador.

export type Cue = { start: number; end: number; text: string };

export type Format = { id: "vertical" | "horizontal" | "quadrado"; label: string; w: number; h: number };
export const FORMATS: Format[] = [
  { id: "vertical", label: "Vertical (Shorts, 9:16)", w: 720, h: 1280 },
  { id: "horizontal", label: "Horizontal (YouTube, 16:9)", w: 1280, h: 720 },
  { id: "quadrado", label: "Quadrado (1:1)", w: 720, h: 720 },
];

export const MAX_SECONDS = 600; // a gravação acontece em tempo real: 10 minutos de áudio levam 10 minutos
export const BACKGROUNDS = [
  { id: "noite", label: "Azul noite", a: "#0f1b3d", b: "#3b3fe0" },
  { id: "grafite", label: "Grafite", a: "#111318", b: "#3a3f4b" },
  { id: "floresta", label: "Verde", a: "#0b2a20", b: "#1f7a52" },
  { id: "sol", label: "Laranja", a: "#4a1a05", b: "#e0731f" },
];

function toSec(t: string): number | null {
  const m = t.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?$/);
  if (!m) return null;
  const ms = m[4] ? Number(m[4].padEnd(3, "0")) : 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]) + ms / 1000;
}

// Lê um arquivo .srt (ou texto colado no mesmo formato)
export function parseSrt(raw: string): Cue[] {
  const cues: Cue[] = [];
  const blocks = raw.replace(/\r/g, "").replace(/^﻿/, "").split(/\n\s*\n/);
  for (const b of blocks) {
    const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [a, z] = lines[i].split("-->").map((s) => s.trim().split(/\s+/)[0]);
    const start = toSec(a), end = toSec(z);
    const text = lines.slice(i + 1).join(" ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (start == null || end == null || !text || end <= start) continue;
    cues.push({ start, end, text });
  }
  return cues.sort((x, y) => x.start - y.start);
}

export const isSrt = (raw: string) => /\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}\s*-->\s*\d/.test(raw);

// Legenda que aparece no instante t (ou null no silêncio)
export function activeCue(cues: Cue[], t: number): Cue | null {
  let lo = 0, hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = cues[mid];
    if (t < c.start) hi = mid - 1;
    else if (t >= c.end) lo = mid + 1;
    else return c;
  }
  return null;
}

// Quebra o texto em linhas que cabem na largura. `measure` devolve a largura de um texto em pixels.
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(next) > maxWidth) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Escolhe o melhor formato de gravação que o navegador sabe fazer (MP4 primeiro: abre em qualquer editor)
export function pickMime(supports: (t: string) => boolean): { mime: string; ext: "mp4" | "webm" } | null {
  const list: [string, "mp4" | "webm"][] = [
    ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "mp4"],
    ["video/mp4;codecs=avc1,mp4a.40.2", "mp4"],
    ["video/webm;codecs=vp9,opus", "webm"],
    ["video/webm;codecs=vp8,opus", "webm"],
    ["video/webm", "webm"],
  ];
  for (const [mime, ext] of list) if (supports(mime)) return { mime, ext };
  return null;
}
