// Procura os silêncios dentro de um trecho de áudio falado, para a legenda e os capítulos caírem no tempo certo.
// Só lê o áudio: nunca altera nada.

export type Silences = {
  duration: number; // duração total do trecho (s)
  lead: number; // silêncio antes da primeira palavra (s)
  trail: number; // silêncio depois da última palavra (s)
  gaps: { start: number; end: number }[]; // pausas no meio da fala (s, a partir do começo do trecho)
};

// threshold em dBFS (volume por janela de 10 ms); minGap = menor pausa que vale a pena marcar
export function analyzeSilence(ch: Float32Array, rate: number, opts: { thresholdDb?: number; minGap?: number } = {}): Silences {
  const { thresholdDb = -46, minGap = 0.14 } = opts;
  const win = Math.max(1, Math.round(rate * 0.01));
  const n = Math.floor(ch.length / win);
  const limit = Math.pow(10, thresholdDb / 20);
  const loud: boolean[] = new Array(n);
  for (let w = 0; w < n; w++) {
    let acc = 0;
    for (let i = w * win, e = i + win; i < e; i++) acc += ch[i] * ch[i];
    loud[w] = Math.sqrt(acc / win) > limit;
  }
  const duration = ch.length / rate;
  const first = loud.indexOf(true);
  if (first < 0) return { duration, lead: duration, trail: 0, gaps: [] };
  let last = n - 1;
  while (last > first && !loud[last]) last--;
  const sec = (w: number) => (w * win) / rate;
  const gaps: { start: number; end: number }[] = [];
  let runStart = -1;
  for (let w = first; w <= last + 1; w++) {
    const quiet = w <= last && !loud[w];
    if (quiet && runStart < 0) runStart = w;
    if (!quiet && runStart >= 0) {
      if (sec(w - runStart) >= minGap) gaps.push({ start: sec(runStart), end: sec(w) });
      runStart = -1;
    }
  }
  return { duration, lead: sec(first), trail: Math.max(0, duration - sec(last + 1)), gaps };
}
