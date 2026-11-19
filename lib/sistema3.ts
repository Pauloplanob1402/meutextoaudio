// Ferramentas de peso baixo, sem IA: links com tempo, conversor de legenda, QR code, banco de ideias.
// Arquivo sem dependências, para ser fácil de testar.

// =====================================================================
// Links com tempo (timestamps) para vídeos do YouTube
// =====================================================================
const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (ID_RE.test(s)) return s;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") { const id = u.pathname.split("/")[1]; return ID_RE.test(id ?? "") ? id : null; }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v && ID_RE.test(v)) return v;
      const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch { /* não é um endereço */ }
  return null;
}

export const timeLink = (id: string, sec: number) => `https://youtu.be/${id}${sec > 0 ? `?t=${Math.round(sec)}` : ""}`;

// Aceita "1:05", "01:02:03" ou segundos
export function parseClock(s: string): number | null {
  const t = s.trim();
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const m = t.match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = m[1] ? parseInt(m[1], 10) : 0, mi = parseInt(m[2], 10), se = parseInt(m[3], 10);
  return se > 59 || (m[1] && mi > 59) ? null : h * 3600 + mi * 60 + se;
}

export const clock = (sec: number) => {
  const s = Math.max(0, Math.round(sec)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
};

// Cada linha: "1:30 Título do trecho" ou só "1:30"
export function buildTimeLinks(id: string, raw: string) {
  const rows: { sec: number; label: string; link: string }[] = [];
  const bad: string[] = [];
  for (const line of raw.split("\n")) {
    const l = line.trim();
    if (!l) continue;
    const m = l.match(/^((?:\d{1,2}:)?\d{1,2}:\d{2}|\d+)\s*[-–—:.)]?\s*(.*)$/);
    const sec = m ? parseClock(m[1]) : null;
    if (!m || sec === null) { bad.push(l.slice(0, 40)); continue; }
    rows.push({ sec, label: m[2].trim(), link: timeLink(id, sec) });
  }
  return { rows, bad };
}

// =====================================================================
// Conversor de legenda (.srt, .vtt e texto puro)
// =====================================================================
export type Cue = { start: number; end: number; text: string };

function parseStamp(s: string): number | null {
  const m = s.trim().match(/^(?:(\d{1,3}):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/);
  if (!m) return null;
  const ms = m[4] ? parseInt(m[4].padEnd(3, "0"), 10) : 0;
  return (m[1] ? parseInt(m[1], 10) * 3600 : 0) + parseInt(m[2], 10) * 60 + parseInt(m[3], 10) + ms / 1000;
}

export function parseSubs(raw: string): Cue[] {
  const text = raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const cues: Cue[] = [];
  for (const block of text.split(/\n{2,}/)) {
    const lines = block.split("\n").map((l) => l.trimEnd());
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [a, rest] = lines[i].split("-->");
    const start = parseStamp(a), end = parseStamp((rest ?? "").trim().split(/\s+/)[0] ?? "");
    if (start === null || end === null) continue;
    const body = lines.slice(i + 1).join("\n").trim();
    if (body) cues.push({ start, end, text: body });
  }
  return cues;
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
function stamp(sec: number, sep: "," | "."): string {
  const t = Math.max(0, Math.round(sec * 1000));
  const h = Math.floor(t / 3600000), m = Math.floor((t % 3600000) / 60000), s = Math.floor((t % 60000) / 1000), ms = t % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)}${sep}${pad(ms, 3)}`;
}

export const toSrt = (cues: Cue[]) => cues.map((c, i) => `${i + 1}\n${stamp(c.start, ",")} --> ${stamp(c.end, ",")}\n${c.text}\n`).join("\n");
export const toVtt = (cues: Cue[]) => "WEBVTT\n\n" + cues.map((c) => `${stamp(c.start, ".")} --> ${stamp(c.end, ".")}\n${c.text}\n`).join("\n");
const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s*\n\s*/g, " ").trim();
export const toPlain = (cues: Cue[], withTimes = false) => cues.map((c) => (withTimes ? `[${clock(c.start)}] ` : "") + strip(c.text)).join(withTimes ? "\n" : " ");
export const shiftCues = (cues: Cue[], sec: number): Cue[] => cues.map((c) => ({ ...c, start: Math.max(0, c.start + sec), end: Math.max(0, c.end + sec) }));

// =====================================================================
// QR code: ajudas de endereço e contraste
// =====================================================================
export function withSubscribe(url: string, on: boolean): string {
  const u = url.trim();
  if (!on || !u) return u;
  try {
    const x = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`);
    if (!/(^|\.)youtube\.com$/.test(x.hostname)) return u;
    x.searchParams.set("sub_confirmation", "1");
    return x.toString();
  } catch { return u; }
}

const lum = (hex: string) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function qrContrast(fg: string, bg: string) {
  const a = lum(fg), b = lum(bg);
  return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), inverted: a > b };
}

// =====================================================================
// Banco de ideias
// =====================================================================
export type IdeaStatus = "nova" | "escolhida" | "feita";
export type IdeaItem = { id: string; text: string; tags: string[]; status: IdeaStatus; created: string; videoId?: string }; // videoId: cartão criado no Painel do vídeo

export function parseIdeaInput(raw: string): { text: string; tags: string[] } {
  const tags = [...new Set((raw.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((t) => t.slice(1).toLowerCase()))];
  const text = raw.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/\s+/g, " ").trim();
  return { text, tags };
}

export function filterIdeas(list: IdeaItem[], q: string, tag: string, status: IdeaStatus | "todas"): IdeaItem[] {
  const n = q.trim().toLowerCase();
  return list.filter((i) => (status === "todas" || i.status === status) && (!tag || i.tags.includes(tag)) && (!n || i.text.toLowerCase().includes(n)));
}

export const allTags = (list: IdeaItem[]) => [...new Set(list.flatMap((i) => i.tags))].sort();
