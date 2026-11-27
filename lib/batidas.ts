// Roteiro em 4 batidas: gancho, conflito, virada e resolução. Regras simples, sem IA.
import { analyzeHookText } from "./toolkit2";
import { countWords } from "./toolkit";

export type BeatId = "gancho" | "conflito" | "virada" | "resolucao";
export type Status = "ok" | "atencao" | "falta";
export type Beat = {
  id: BeatId; name: string; text: string; words: number; seconds: number; share: number;
  status: Status; found: string | null; tips: string[];
};

export const BEAT_NAMES: Record<BeatId, string> = { gancho: "Gancho", conflito: "Conflito", virada: "Virada", resolucao: "Resolução" };
const ORDER: BeatId[] = ["gancho", "conflito", "virada", "resolucao"];
export const BEAT_HELP: Record<BeatId, string> = {
  gancho: "Prende a atenção nos primeiros segundos.",
  conflito: "Mostra o problema, o risco ou a dúvida.",
  virada: "O momento em que algo muda: a descoberta ou a solução.",
  resolucao: "Fecha o assunto e diz o próximo passo.",
};

const TENSION = /\b(problema|erro|errei|errado|medo|travad[oa]|difícil|dificuldade|não (consegu|funcion|dá)|mas|porém|só que|até que|perdi|fracasso|frustr|cansad|ninguém|risco|perigo|dúvida|sem (resultado|view|visualiza))/i;
const TURN = /\b(descobri|percebi|foi (aí|quando)|então (eu )?(entendi|percebi|descobri)|o segredo|a chave|a virada|mudou (tudo|minha)|nesse momento|de repente|a solução|o que (mudou|funcionou)|a verdade é)/i;
const CTA = /\b(inscreva|inscrev|se inscreve|ativa o sino|comente|comenta|deixe (o|seu|um)|deixa (o|seu|um)|compartilh|assista|assiste|próximo vídeo|link (na|abaixo)|clique|me conta|conta pra mim|nos vemos)/i;

// Divide em frases curtas (mantém a pontuação)
export function sentences(text: string): string[] {
  return text.split(/\n+|(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
}

const sec = (words: number, wpm: number) => (words / Math.max(wpm, 1)) * 60;
const snippet = (s: string) => (s.length > 140 ? s.slice(0, 137).trimEnd() + "…" : s);

// Separa nas 4 partes. Manual: quatro trechos separados por uma linha com ---. Automático: por posição.
export function splitBeats(raw: string): { parts: Record<BeatId, string[]>; manual: boolean } | null {
  const text = raw.trim();
  if (!text) return null;
  const manualParts = text.split(/^\s*-{3,}\s*$/m).map((p) => p.trim()).filter(Boolean);
  if (manualParts.length === 4) {
    const parts = {} as Record<BeatId, string[]>;
    ORDER.forEach((id, i) => (parts[id] = sentences(manualParts[i])));
    return { parts, manual: true };
  }
  const sents = sentences(text.replace(/^\s*-{3,}\s*$/gm, ""));
  const counts = sents.map(countWords);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const parts: Record<BeatId, string[]> = { gancho: [], conflito: [], virada: [], resolucao: [] };
  let acc = 0;
  sents.forEach((s, i) => {
    const mid = (acc + counts[i] / 2) / total; // posição do meio da frase
    acc += counts[i];
    const id: BeatId = mid < 0.12 ? "gancho" : mid < 0.35 ? "conflito" : mid < 0.75 ? "virada" : "resolucao";
    parts[id].push(s);
  });
  // a virada de verdade costuma vir marcada: leva a primeira frase marcada, depois do gancho, para o começo da virada
  const idx = sents.findIndex((s, i) => TURN.test(s) && i > parts.gancho.length);
  if (idx >= 0) {
    const g = parts.gancho.length, c = parts.conflito.length;
    if (idx < g + c && idx >= g) {
      parts.conflito = sents.slice(g, idx);
      parts.virada = [...sents.slice(idx, g + c), ...parts.virada];
    }
  }
  // o gancho não passa de ~30 s de fala: o resto vai para o conflito
  return { parts, manual: false };
}

export function analyzeBeats(raw: string, wpm: number): { beats: Beat[]; manual: boolean; totalSeconds: number } | null {
  const sp = splitBeats(raw);
  if (!sp) return null;
  const texts = ORDER.map((id) => sp.parts[id].join(" "));
  const words = texts.map(countWords);
  const totalWords = words.reduce((a, b) => a + b, 0) || 1;

  const beats: Beat[] = ORDER.map((id, i) => {
    const list = sp.parts[id];
    const seconds = sec(words[i], wpm);
    const share = Math.round((words[i] / totalWords) * 100);
    const tips: string[] = [];
    let status: Status = "ok";
    let found: string | null = null;

    if (!list.length) {
      return { id, name: BEAT_NAMES[id], text: "", words: 0, seconds: 0, share: 0, status: "falta", found: null, tips: [`Não encontramos o ${BEAT_NAMES[id].toLowerCase()}. ${BEAT_HELP[id]}`] };
    }

    if (id === "gancho") {
      const a = analyzeHookText(texts[i], wpm);
      found = snippet(list[0]);
      tips.push(...a.notes);
      if (seconds > 30) tips.push(`O começo tem cerca de ${Math.round(seconds)} s antes do conflito. Tente chegar ao problema em até 30 s.`);
      if (a.weakOpener || a.firstWords > 12) status = "atencao";
    } else if (id === "conflito") {
      const hit = [...list, ...sp.parts.gancho.slice(1)].find((s) => TENSION.test(s));
      if (hit) found = snippet(hit);
      else { status = "atencao"; tips.push("Não achamos tensão clara aqui (problema, erro, medo, dúvida). Diga o que está em jogo e o que acontece se nada mudar."); }
    } else if (id === "virada") {
      const hit = list.find((s) => TURN.test(s));
      if (hit) found = snippet(hit);
      else { status = "atencao"; tips.push("Não achamos um momento de virada. Marque a mudança com frases como “foi aí que descobri…” ou “o segredo é…”."); }
    } else {
      const k = list.findIndex((s) => CTA.test(s));
      if (k < 0) { status = "atencao"; tips.push("Não achamos o convite final (inscrever, comentar, ver outro vídeo). Diga uma única ação para o espectador fazer."); }
      else {
        found = snippet(list[k]);
        const ctaSecs = sec(countWords(list.slice(k).join(" ")), wpm);
        if (ctaSecs > 15) { status = "atencao"; tips.push(`O pedido final dura cerca de ${Math.round(ctaSecs)} s. Deixe em até 15 s e com uma ação só.`); }
        if (list.length === 1 || k === 0) tips.push("Antes do convite, feche a ideia em uma frase que resuma o que a pessoa levou do vídeo.");
      }
    }

    // proporção
    if (id === "gancho" && share > 20) { status = "atencao"; tips.push(`O começo ocupa ${share}% do roteiro. Costuma funcionar melhor com até uns 10%.`); }
    if (id === "virada" && share < 15) { status = "atencao"; tips.push(`A virada ocupa só ${share}%. É o coração do vídeo: dê mais espaço a ela.`); }
    if (id === "resolucao" && share > 30) { status = "atencao"; tips.push(`O final ocupa ${share}% do roteiro. Fechar mais rápido segura melhor quem chegou até aqui.`); }

    return { id, name: BEAT_NAMES[id], text: texts[i], words: words[i], seconds, share, status, found, tips };
  });

  return { beats, manual: sp.manual, totalSeconds: sec(totalWords, wpm) };
}
