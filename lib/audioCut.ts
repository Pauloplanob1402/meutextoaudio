// Extrair e cortar áudio: lógica pura (sem tela). O áudio chega em Float32 (esquerda/direita).

export const CUT_RATE = 44100;
export const MAX_FILE_MB = 400;
export const MAX_MINUTES_DECODE = 40;

// Picos para desenhar a forma da onda: um valor (0 a 1) por faixa
export function peaks(ch: Float32Array, buckets: number): Float32Array {
  const out = new Float32Array(buckets);
  const size = Math.max(1, Math.floor(ch.length / buckets));
  for (let b = 0; b < buckets; b++) {
    let m = 0;
    for (let i = b * size, e = Math.min(ch.length, i + size); i < e; i++) { const a = ch[i] < 0 ? -ch[i] : ch[i]; if (a > m) m = a; }
    out[b] = m;
  }
  return out;
}

// "1:23,5" -> 83.5 ; "90" -> 90 ; "1:02:03" -> 3723. Devolve null se não entender.
export function parseTime(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!t) return null;
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(t)) return null;
  const parts = t.split(":").map(Number);
  if (parts.slice(1).some((p) => p >= 60)) return null;
  let sec = 0;
  for (const p of parts) sec = sec * 60 + p;
  return Number.isFinite(sec) ? sec : null;
}

export function fmtTime(sec: number, decimals = 1): string {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s - h * 3600 - m * 60;
  const rs = r.toFixed(decimals).padStart(decimals ? decimals + 3 : 2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${rs}` : `${m}:${rs}`;
}

// Recorta [start, end) em segundos, com entrada e saída suaves (fade, em segundos), e opção de mono
export function cutChannels(ch: Float32Array[], rate: number, start: number, end: number, fade: number, mono: boolean): { left: Float32Array; right: Float32Array } {
  const n = ch[0].length;
  const a = Math.max(0, Math.min(n, Math.round(start * rate)));
  const b = Math.max(a, Math.min(n, Math.round(end * rate)));
  const len = b - a;
  const L = ch[0].slice(a, b);
  const R = (ch[1] ?? ch[0]).slice(a, b);
  if (mono) for (let i = 0; i < len; i++) { const m = (L[i] + R[i]) / 2; L[i] = m; R[i] = m; }
  const f = Math.min(Math.round(fade * rate), Math.floor(len / 2));
  for (let i = 0; i < f; i++) {
    const g = i / f;
    L[i] *= g; R[i] *= g;
    L[len - 1 - i] *= g; R[len - 1 - i] *= g;
  }
  return { left: L, right: mono ? L : R };
}
