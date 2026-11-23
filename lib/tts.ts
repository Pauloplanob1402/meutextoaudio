// ---------- ajustes rápidos (mexa aqui) ----------
export const PARAGRAPH_PAUSE = 0.7; // segundos de silêncio entre parágrafos
export const CHUNK_PAUSE = 0.15; // segundos entre trechos da mesma frase longa
export const DEFAULT_PAUSE = 1.5; // usado se [PAUSA] vier sem número
export const MAX_PAUSE = 30; // limite de segurança por pausa
export const WORDS_PER_MINUTE = 155; // ritmo da voz, só para a estimativa de duração (ajuste depois de testar)

// Voz usada pelo app (Piper, português do Brasil)
export const VOICE_ID = "pt_BR-faber-medium";

export const SAMPLE_TEXT =
  "Olá! Este é um teste de voz em português do Brasil.\n\n[PAUSA - 2 segundos]\n\nSe você está ouvindo isso, a geração de áudio no navegador está funcionando.";

// ---------- utilitários ----------

export type Part =
  | { kind: "text"; text: string }
  | { kind: "pause"; seconds: number };

// Divide em blocos de frases para não travar e dar progresso
export function splitText(text: string, max = 300): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > max && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// Limpa caracteres que podem derrubar o fonemizador (travessões, aspas curvas,
// emojis, símbolos). Mantém letras com acento, números e pontuação comum.
export function cleanForTTS(t: string): string {
  return t
    .replace(/[\u2014\u2013]/g, ", ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[^A-Za-z0-9\u00C0-\u00FF\s.,;:!?'"()\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const hasSpeakable = (t: string) => /[A-Za-z0-9\u00C0-\u00FF]/.test(t);

// Transforma o texto em uma lista de trechos para ler e pausas de silêncio.
// - [PAUSA ... X segundos ...] vira X segundos de silêncio
// - qualquer outro [colchete] é removido (não é lido em voz alta)
// - parágrafos ganham uma pausa automática
export function parseScript(raw: string): Part[] {
  const parts: Part[] = [];

  const pushText = (t: string) => {
    const clean = t.replace(/\[[^\]]*\]/g, "");
    const paragraphs = clean
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    paragraphs.forEach((p, i) => {
      if (i > 0) parts.push({ kind: "pause", seconds: PARAGRAPH_PAUSE });
      splitText(p, 500).forEach((c, j) => {
        const cleaned = cleanForTTS(c);
        if (!hasSpeakable(cleaned)) return;
        if (j > 0) parts.push({ kind: "pause", seconds: CHUNK_PAUSE });
        parts.push({ kind: "text", text: cleaned });
      });
    });
  };

  const re = /\[\s*PAUSA([^\]]*)\]/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    pushText(raw.slice(last, m.index));
    const num = m[1].match(/(\d+(?:[.,]\d+)?)/);
    const seconds = Math.min(
      num ? parseFloat(num[1].replace(",", ".")) : DEFAULT_PAUSE,
      MAX_PAUSE
    );
    parts.push({ kind: "pause", seconds });
    last = m.index + m[0].length;
  }
  pushText(raw.slice(last));

  return parts;
}

// Estimativa da duração do áudio final (palavras / ritmo + pausas), na velocidade escolhida.
// É só uma estimativa: a duração real depende da voz.
export function estimateSeconds(raw: string, speed = 1, wpm = WORDS_PER_MINUTE): number {
  const { words, pauses } = scriptStats(raw);
  return ((words / wpm) * 60 + pauses) / speed;
}

// Palavras a falar e segundos de pausa do roteiro. Serve para a estimativa e para calibrar o ritmo de cada voz.
export function scriptStats(raw: string): { words: number; pauses: number } {
  let words = 0;
  let pauses = 0;
  for (const p of parseScript(raw)) {
    if (p.kind === "pause") pauses += p.seconds;
    else words += p.text.split(/\s+/).filter(Boolean).length;
  }
  return { words, pauses };
}

// 200 -> "3 min 20 s", 45 -> "45 s"
export function formatDuration(sec: number): string {
  const s = sec < 10 ? Math.max(1, Math.round(sec)) : Math.round(sec / 5) * 5;
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} s` : `${m} min`;
}

// Junta WAVs e silêncios (números = segundos) em um único WAV
export async function mergeParts(parts: (Blob | number)[]): Promise<Blob> {
  const ctx = new AudioContext();
  const rate = ctx.sampleRate;

  const decoded: (AudioBuffer | number)[] = [];
  for (const p of parts) {
    if (typeof p === "number") decoded.push(Math.round(p * rate));
    else decoded.push(await ctx.decodeAudioData(await p.arrayBuffer()));
  }
  await ctx.close();

  const lengthOf = (d: AudioBuffer | number) =>
    typeof d === "number" ? d : d.length;
  const total = decoded.reduce<number>((n, d) => n + lengthOf(d), 0);

  const pcm = new Int16Array(total); // começa zerado, ou seja, silêncio
  let offset = 0;
  for (const d of decoded) {
    if (typeof d === "number") {
      offset += d;
      continue;
    }
    const data = d.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      pcm[offset++] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
  }

  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const write = (o: number, str: string) =>
    [...str].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  write(0, "RIFF");
  v.setUint32(4, 36 + pcm.byteLength, true);
  write(8, "WAVE");
  write(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  write(36, "data");
  v.setUint32(40, pcm.byteLength, true);

  return new Blob([header, pcm.buffer], { type: "audio/wav" });
}

