// Ajuste de velocidade SEM mudar o tom da voz (algoritmo WSOLA), feito no navegador.
// Funciona bem para mudanças pequenas (de 0,85x a 1,2x). Mudanças maiores
// tendem a deixar a voz com som levemente artificial.

function hann(n: number) {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n);
  return w;
}

export async function wsola(
  x: Float32Array,
  speed: number,
  sr: number,
  tick?: () => Promise<void>
): Promise<Float32Array> {
  const win = Math.round((sr * 0.025) / 2) * 2; // janela de ~25 ms
  const hop = win / 2;
  const tol = Math.round(sr * 0.01); // procura o melhor encaixe em ±10 ms
  const D = 4; // compara 1 a cada 4 amostras (mais rápido)
  const w = hann(win);
  const outLen = Math.ceil(x.length / speed);
  const out = new Float32Array(outLen + win * 2);
  const at = (i: number) => (i >= 0 && i < x.length ? x[i] : 0);

  let prev = 0;
  for (let i = 0; i < win; i++) out[i] += at(i) * w[i];

  for (let k = 1; ; k++) {
    const o = k * hop;
    if (o >= outLen) break;
    const ideal = Math.round(k * hop * speed);
    if (ideal >= x.length) break;

    const target = prev + hop; // continuação natural do trecho anterior
    let best = ideal;
    let bestScore = -Infinity;
    const lo = Math.max(0, ideal - tol);
    const hi = Math.min(Math.max(0, x.length - win), ideal + tol);
    for (let p = lo; p <= hi; p += 2) {
      let dot = 0;
      let eng = 1e-9;
      for (let i = 0; i < hop; i += D) {
        const a = at(p + i);
        dot += a * at(target + i);
        eng += a * a;
      }
      const s = dot / Math.sqrt(eng);
      if (s > bestScore) { bestScore = s; best = p; }
    }
    prev = best;
    for (let i = 0; i < win; i++) out[o + i] += at(best + i) * w[i];
    if (tick && k % 400 === 0) await tick();
  }
  return out.subarray(0, outLen);
}

export async function stretchWav(blob: Blob, speed: number): Promise<Blob> {
  let ctx: AudioContext;
  try { ctx = new AudioContext({ sampleRate: 22050 }); } catch { ctx = new AudioContext(); }
  const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
  const sr = ctx.sampleRate;
  await ctx.close();

  const y = await wsola(buf.getChannelData(0), speed, sr, () => new Promise((r) => setTimeout(r, 0)));

  let peak = 0;
  for (let i = 0; i < y.length; i++) peak = Math.max(peak, Math.abs(y[i]));
  const g = peak > 1 ? 1 / peak : 1;
  const pcm = new Int16Array(y.length);
  for (let i = 0; i < y.length; i++) {
    const s = Math.max(-1, Math.min(1, y[i] * g));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const write = (o: number, str: string) => [...str].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  write(0, "RIFF"); v.setUint32(4, 36 + pcm.byteLength, true); write(8, "WAVE"); write(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  write(36, "data"); v.setUint32(40, pcm.byteLength, true);
  return new Blob([header, pcm.buffer], { type: "audio/wav" });
}
