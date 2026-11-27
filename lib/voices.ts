// Vozes em português disponíveis no Texto em áudio. Todas rodam no navegador.
// Para acrescentar uma voz: inclua uma linha aqui. O resto (seletor, download, hospedagem própria) lê esta lista.
//
// Dois motores:
// - "piper": vozes rápidas e leves (uns 60 MB cada), de qualidade boa;
// - "kokoro": vozes mais naturais, porém mais lentas. Um modelo só (uns 90 MB) serve as três.

export type VoiceInfo = {
  id: string; // identificador (no Piper, o nome da voz; no Kokoro, "kokoro:" + nome)
  name: string; // nome mostrado no seletor
  lang: "pt-BR" | "pt-PT";
  note: string; // frase curta ao lado do nome
  engine: "piper" | "kokoro" | "clone"; // "clone" é só a Minha voz (beta), que não entra na lista VOICES
  plan: "free" | "pro"; // free: qualquer pessoa; pro: só quem tem o plano Criador ativo
  path?: string; // Piper: caminho do arquivo .onnx dentro do repositório de vozes
  official?: boolean; // Piper: voz que o espelho não tem; baixamos do repositório oficial
  kokoro?: string; // Kokoro: nome da voz dentro do modelo
};

// Voz inicial: a Faber para quem tem o plano Criador, a Cadu para os demais.
export const DEFAULT_VOICE_ID = "pt_BR-faber-medium";
export const DEFAULT_FREE_VOICE_ID = "pt_BR-cadu-medium";

export const VOICES: VoiceInfo[] = [
  { id: "pt_BR-faber-medium", name: "Faber", lang: "pt-BR", note: "Padrão, voz masculina", engine: "piper", plan: "pro", path: "pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx" },
  { id: "pt_BR-cadu-medium", name: "Cadu", lang: "pt-BR", note: "Voz masculina", engine: "piper", plan: "free", path: "pt/pt_BR/cadu/medium/pt_BR-cadu-medium.onnx", official: true },
  { id: "pt_BR-jeff-medium", name: "Jeff", lang: "pt-BR", note: "Voz masculina", engine: "piper", plan: "free", path: "pt/pt_BR/jeff/medium/pt_BR-jeff-medium.onnx", official: true },
  { id: "pt_PT-tugão-medium", name: "Tugão", lang: "pt-PT", note: "Português de Portugal, masculina", engine: "piper", plan: "pro", path: "pt/pt_PT/tugão/medium/pt_PT-tugão-medium.onnx" },
  { id: "kokoro:pf_dora", name: "Dora", lang: "pt-BR", note: "Voz feminina", engine: "kokoro", plan: "pro", kokoro: "pf_dora" },
  { id: "kokoro:pm_alex", name: "Alex", lang: "pt-BR", note: "Voz masculina", engine: "kokoro", plan: "pro", kokoro: "pm_alex" },
  { id: "kokoro:pm_santa", name: "Santa", lang: "pt-BR", note: "Voz masculina", engine: "kokoro", plan: "pro", kokoro: "pm_santa" },
];

export const getVoice = (id: string | null | undefined) =>
  VOICES.find((v) => v.id === id) ?? VOICES[0];

// "Cadu e Jeff", "Faber, Tugão, Dora, Alex e Santa": usado nos textos dos planos e dos Termos.
export function voiceNames(plan: "free" | "pro"): string {
  const n = VOICES.filter((v) => v.plan === plan).map((v) => v.name);
  return n.length > 1 ? `${n.slice(0, -1).join(", ")} e ${n[n.length - 1]}` : n[0] ?? "";
}
