// Converte o WAV gerado pelo app em MP3, direto no navegador (sem servidor, sem custo).
// Os WAVs do app (lib/tts.ts e lib/stretch.ts) são sempre mono, 16 bits.

import { Mp3Encoder } from "@breezystack/lamejs";

// ---------- ajuste rápido (mexa aqui) ----------
export const MP3_KBPS = 96; // 96 é ótimo para voz falada. Suba para 128 se quiser mais qualidade.

// Taxas que o formato MP3 aceita
const MP3_RATES = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];

// Lê o WAV (mono, 16 bits) e devolve as amostras e a taxa de amostragem
function readWav(buf: ArrayBuffer): { pcm: Int16Array; rate: number } {
  const v = new DataView(buf);
  const tag = (o: number) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
  if (buf.byteLength < 44 || tag(0) !== "RIFF" || tag(8) !== "WAVE") throw new Error("não é um WAV");

  const rate = v.getUint32(24, true);
  let o = 12;
  while (o + 8 <= buf.byteLength) {
    const size = v.getUint32(o + 4, true);
    if (tag(o) === "data") {
      const start = o + 8;
      const bytes = Math.min(size, buf.byteLength - start);
      return { pcm: new Int16Array(buf.slice(start, start + (bytes & ~1))), rate };
    }
    o += 8 + size + (size & 1);
  }
  throw new Error("WAV sem dados");
}

export async function wavToMp3(wav: Blob, kbps = MP3_KBPS): Promise<Blob> {
  const { pcm, rate } = readWav(await wav.arrayBuffer());
  if (!MP3_RATES.includes(rate)) throw new Error(`taxa ${rate} Hz não suportada no MP3`);

  const enc = new Mp3Encoder(1, rate, kbps);
  const BLOCK = 1152 * 20;
  const out: Uint8Array[] = [];
  for (let i = 0, n = 0; i < pcm.length; i += BLOCK, n++) {
    const part = enc.encodeBuffer(pcm.subarray(i, i + BLOCK));
    if (part.length) out.push(new Uint8Array(part));
    if (n % 40 === 39) await new Promise((r) => setTimeout(r, 0)); // deixa a tela respirar
  }
  const end = enc.flush();
  if (end.length) out.push(new Uint8Array(end));

  return new Blob(out as BlobPart[], { type: "audio/mpeg" });
}
