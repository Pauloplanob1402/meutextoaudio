// Vozes em português disponíveis no Texto em áudio (todas Piper, rodando no navegador).
// Para acrescentar uma voz: inclua uma linha aqui. O resto (seletor, download, hospedagem própria) lê esta lista.

export type VoiceInfo = {
  id: string; // identificador do Piper
  name: string; // nome mostrado no seletor
  lang: "pt-BR" | "pt-PT";
  note: string; // frase curta ao lado do nome
  path: string; // caminho do arquivo .onnx dentro do repositório de vozes
  // vozes que a biblioteca ainda não conhece: o app baixa direto do repositório oficial
  official?: boolean;
};

export const DEFAULT_VOICE_ID = "pt_BR-faber-medium";

export const VOICES: VoiceInfo[] = [
  { id: "pt_BR-faber-medium", name: "Faber", lang: "pt-BR", note: "Padrão, voz masculina", path: "pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx" },
  { id: "pt_BR-cadu-medium", name: "Cadu", lang: "pt-BR", note: "Voz masculina", path: "pt/pt_BR/cadu/medium/pt_BR-cadu-medium.onnx", official: true },
  { id: "pt_BR-jeff-medium", name: "Jeff", lang: "pt-BR", note: "Voz masculina", path: "pt/pt_BR/jeff/medium/pt_BR-jeff-medium.onnx", official: true },
  { id: "pt_BR-edresson-low", name: "Edresson", lang: "pt-BR", note: "Voz masculina, mais leve", path: "pt/pt_BR/edresson/low/pt_BR-edresson-low.onnx" },
  { id: "pt_PT-tugão-medium", name: "Tugão", lang: "pt-PT", note: "Português de Portugal, masculina", path: "pt/pt_PT/tugão/medium/pt_PT-tugão-medium.onnx" },
];

export const getVoice = (id: string | null | undefined) =>
  VOICES.find((v) => v.id === id) ?? VOICES[0];
