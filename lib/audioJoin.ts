// Juntar áudios: lógica pura (sem tela). Cada faixa chega como esquerda/direita em Float32 (44,1 kHz)
// e sai, em ordem, para um "escritor" (MP3 ou WAV). Só uma faixa fica na memória por vez, mais o pedaço
// final da anterior quando há transição suave.

export const JOIN_RATE = 44100;
export const MAX_TRACKS = 20;
export const MAX_MINUTES_MP3 = 60;
export const MAX_MINUTES_WAV = 20;

export type Transition = { id: string; label: string; gap: number; fade: number };
export const TRANSITIONS: Transition[] = [
  { id: "direto", label: "Colar direto, sem pausa", gap: 0, fade: 0 },
  { id: "gap1", label: "Silêncio de 1 segundo", gap: 1, fade: 0 },
  { id: "gap2", label: "Silêncio de 2 segundos", gap: 2, fade: 0 },
  { id: "fade3", label: "Transição suave de 3 segundos", gap: 0, fade: 3 },
  { id: "fade5", label: "Transição suave de 5 segundos", gap: 0, fade: 5 },
];

export type Chunk = { left: Float32Array; right: Float32Array };
export type Sink = (c: Chunk) => void | Promise<void>;

const slice = (c: Chunk, a: number, b: number): Chunk => ({ left: c.left.subarray(a, b), right: c.right.subarray(a, b) });

// Mistura o fim da faixa anterior (some) com o começo da próxima (entra), com potência constante.
function crossfade(tail: Chunk, head: Chunk): Chunk {
  const n = Math.min(tail.left.length, head.left.length);
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 1;
    const a = Math.cos((t * Math.PI) / 2);
    const b = Math.sin((t * Math.PI) / 2);
    l[i] = Math.max(-1, Math.min(1, tail.left[i] * a + head.left[i] * b));
    r[i] = Math.max(-1, Math.min(1, tail.right[i] * a + head.right[i] * b));
  }
  return { left: l, right: r };
}

// Recebe as faixas uma a uma (a ordem de chamada é a ordem do áudio) e escreve o resultado no `sink`.
export function createJoiner(sink: Sink, t: Transition, rate = JOIN_RATE) {
  const fadeSamples = Math.round(t.fade * rate);
  const gapSamples = Math.round(t.gap * rate);
  let tail: Chunk | null = null;
  let count = 0;

  return {
    async add(track: Chunk) {
      const len = track.left.length;
      if (!len) return;
      let from = 0;
      if (count > 0 && gapSamples > 0) await sink({ left: new Float32Array(gapSamples), right: new Float32Array(gapSamples) });
      if (tail && fadeSamples > 0) {
        const overlap = Math.min(tail.left.length, Math.floor(len / 2));
        if (overlap > 0) {
          await sink(crossfade(slice(tail, tail.left.length - overlap, tail.left.length), slice(track, 0, overlap)));
          from = overlap;
        } else if (tail.left.length) await sink(tail);
        tail = null;
      } else if (tail) {
        await sink(tail);
        tail = null;
      }
      if (fadeSamples > 0) {
        const keep = Math.min(fadeSamples, Math.floor(len / 2), len - from);
        if (len - from - keep > 0) await sink(slice(track, from, len - keep));
        // copia o final: a faixa inteira pode ser liberada da memória
        tail = { left: track.left.slice(len - keep), right: track.right.slice(len - keep) };
      } else {
        await sink(slice(track, from, len));
      }
      count++;
    },
    async finish() {
      if (tail && tail.left.length) await sink(tail);
      tail = null;
    },
  };
}

export const toInt16 = (f: Float32Array): Int16Array => {
  const o = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    o[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return o;
};

// WAV estéreo de 16 bits a partir de pedaços já em Int16 intercalados (L,R,L,R...)
export function wavFromInterleaved(parts: Int16Array[], rate = JOIN_RATE): Blob {
  const bytes = parts.reduce((n, p) => n + p.byteLength, 0);
  const head = new ArrayBuffer(44);
  const v = new DataView(head);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + bytes, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, bytes, true);
  return new Blob([head, ...(parts as BlobPart[])], { type: "audio/wav" });
}

export const fmtDur = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};
