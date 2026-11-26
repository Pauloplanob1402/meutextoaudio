// Lê um arquivo de áudio ou vídeo e entrega o som em mono, 16 kHz (o formato que o reconhecimento de voz espera).
export type Decoded = { data: Float32Array; seconds: number; totalSeconds: number; decodeMs: number };

export async function decodeTo16kMono(file: File, limitSec?: number): Promise<Decoded> {
  const t0 = performance.now();
  const bytes = await file.arrayBuffer();
  const ctx = new AudioContext();
  let buf: AudioBuffer;
  try {
    buf = await ctx.decodeAudioData(bytes);
  } finally {
    ctx.close().catch(() => {});
  }
  const totalSeconds = buf.duration;
  const seconds = limitSec ? Math.min(limitSec, totalSeconds) : totalSeconds;
  const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(seconds * 16000)), 16000);
  const src = off.createBufferSource();
  src.buffer = buf;
  src.connect(off.destination);
  src.start(0);
  const out = await off.startRendering();
  return { data: out.getChannelData(0).slice(), seconds, totalSeconds, decodeMs: performance.now() - t0 };
}
