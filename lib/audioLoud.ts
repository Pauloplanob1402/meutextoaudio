// Ajuste de volume: medição de loudness integrado (ITU-R BS.1770 / EBU R128) e normalização.
// Lógica pura, sem tela. O áudio chega em Float32 a 48 kHz (esquerda/direita).

export const LOUD_RATE = 48000;
export const MAX_MINUTES = 30;

export type Target = { id: string; label: string; lufs: number; hint: string };
export const TARGETS: Target[] = [
  { id: "yt", label: "YouTube (−14 LUFS)", lufs: -14, hint: "O padrão para vídeos. O YouTube só abaixa o que passa disso." },
  { id: "voz", label: "Voz e podcast (−16 LUFS)", lufs: -16, hint: "Um pouco mais suave, bom para narração longa." },
  { id: "suave", label: "Suave (−18 LUFS)", lufs: -18, hint: "Para quem vai misturar com música ao fundo depois." },
];

type Biquad = { b0: number; b1: number; b2: number; a1: number; a2: number };
// Filtros da norma (valores para 48 kHz): degrau de agudos e passa-altas.
const SHELF: Biquad = { b0: 1.53512485958697, b1: -2.69169618940638, b2: 1.19839281085285, a1: -1.69065929318241, a2: 0.73248077421585 };
const HIGHPASS: Biquad = { b0: 1, b1: -2, b2: 1, a1: -1.99004745483398, a2: 0.99007225036621 };

function makeFilter(c: Biquad) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x: number) => {
    const y = c.b0 * x + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

export type Measure = { lufs: number; peakDb: number; seconds: number; silent: boolean };

export const toDb = (x: number) => (x > 0 ? 20 * Math.log10(x) : -Infinity);

export function measure(channels: Float32Array[], rate = LOUD_RATE): Measure {
  const n = channels[0]?.length ?? 0;
  const step = Math.round(rate * 0.1); // passos de 100 ms; bloco = 4 passos (400 ms, 75% de sobreposição)
  const steps = Math.floor(n / step);
  const sums = new Float64Array(steps); // soma das energias de todos os canais em cada passo
  let peak = 0;
  for (const ch of channels) {
    const f1 = makeFilter(SHELF), f2 = makeFilter(HIGHPASS);
    for (let s = 0; s < steps; s++) {
      let acc = 0;
      for (let i = s * step, e = i + step; i < e; i++) {
        const v = ch[i];
        const a = v < 0 ? -v : v;
        if (a > peak) peak = a;
        const k = f2(f1(v));
        acc += k * k;
      }
      sums[s] += acc / step;
    }
    for (let i = steps * step; i < n; i++) { const a = Math.abs(ch[i]); if (a > peak) peak = a; }
  }
  const blocks: number[] = [];
  for (let s = 0; s + 4 <= steps; s++) blocks.push((sums[s] + sums[s + 1] + sums[s + 2] + sums[s + 3]) / 4);
  const loud = (z: number) => -0.691 + 10 * Math.log10(z);
  const abs = blocks.filter((z) => z > 0 && loud(z) > -70);
  const base = { peakDb: toDb(peak), seconds: n / rate };
  if (!abs.length) return { ...base, lufs: -Infinity, silent: true };
  const relThreshold = loud(abs.reduce((a, b) => a + b, 0) / abs.length) - 10;
  const kept = abs.filter((z) => loud(z) > relThreshold);
  const use = kept.length ? kept : abs;
  return { ...base, lufs: loud(use.reduce((a, b) => a + b, 0) / use.length), silent: false };
}

// Limitador suave: abaixo do "joelho" não mexe; acima dele curva o pico até o teto sem cortar seco.
export function softLimit(x: number, ceiling: number): number {
  const knee = ceiling * 0.8;
  const a = x < 0 ? -x : x;
  if (a <= knee) return x;
  const y = knee + (ceiling - knee) * Math.tanh((a - knee) / (ceiling - knee));
  return x < 0 ? -y : y;
}

export const dbToGain = (db: number) => Math.pow(10, db / 20);

export type Plan = { gainDb: number; willClip: boolean; peakAfterDb: number };

// Quanto de ganho falta para chegar ao alvo, e se o pico passaria do teto.
export function planGain(m: Measure, targetLufs: number, ceilingDb = -1): Plan {
  if (m.silent) return { gainDb: 0, willClip: false, peakAfterDb: m.peakDb };
  const gainDb = targetLufs - m.lufs;
  const peakAfterDb = m.peakDb + gainDb;
  return { gainDb, peakAfterDb, willClip: peakAfterDb > ceilingDb };
}

// Aplica o ganho (e, se pedido, o limitador) e devolve novos canais.
export function applyGain(channels: Float32Array[], gainDb: number, limit: boolean, ceilingDb = -1): Float32Array[] {
  const g = dbToGain(gainDb);
  const ceil = dbToGain(ceilingDb);
  return channels.map((ch) => {
    const o = new Float32Array(ch.length);
    for (let i = 0; i < ch.length; i++) {
      const v = ch[i] * g;
      o[i] = limit ? softLimit(v, ceil) : Math.max(-1, Math.min(1, v));
    }
    return o;
  });
}

export const fmtLufs = (v: number) => (Number.isFinite(v) ? `${v.toFixed(1).replace(".", ",")} LUFS` : "silêncio");
export const fmtDb = (v: number) => (Number.isFinite(v) ? `${v.toFixed(1).replace(".", ",")} dB` : "—");

// Texto simples que explica a medição, em português claro
export function describe(m: Measure, targetLufs: number): string {
  if (m.silent) return "Não encontramos som suficiente para medir.";
  const d = m.lufs - targetLufs;
  if (Math.abs(d) <= 1) return "O volume já está bem perto do alvo.";
  if (d > 0) return `O áudio está ${d.toFixed(1).replace(".", ",")} dB mais alto que o alvo. No YouTube ele seria abaixado automaticamente.`;
  return `O áudio está ${(-d).toFixed(1).replace(".", ",")} dB mais baixo que o alvo. Dá para subir sem distorcer, se o pico deixar.`;
}
