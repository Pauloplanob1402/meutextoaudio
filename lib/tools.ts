// Lista das ferramentas extras. Para adicionar uma nova: crie o componente em
// components/tools, registre em components/tools/ToolView.tsx e inclua aqui.

export type GroupId = "roteiro" | "publicar" | "imagem" | "planejar";

export type ToolInfo = {
  slug: string;
  title: string;
  short: string; // frase curta do cartão
  intro: string; // frase no topo da página da ferramenta
  group: GroupId;
  start?: boolean; // "Bom para começar"
};

export const GROUPS: { id: GroupId; title: string; hint: string }[] = [
  { id: "roteiro", title: "Roteiro e áudio", hint: "Para preparar o texto e o som." },
  { id: "publicar", title: "Na hora de publicar", hint: "Título, descrição, legendas e conferência final." },
  { id: "imagem", title: "Imagens", hint: "Miniatura, banner e foto de perfil." },
  { id: "planejar", title: "Planejamento", hint: "Organize a semana e faça as contas." },
];

export const TOOLS: ToolInfo[] = [
  { slug: "tempo-de-fala", group: "roteiro", title: "Tempo de fala", short: "Veja quanto tempo o seu texto dura falado.", intro: "Cole o texto e descubra quanto tempo ele leva para ser falado." },
  { slug: "dividir-texto", group: "roteiro", title: "Dividir texto em blocos", short: "Parta um texto longo sem cortar frases no meio.", intro: "Cole um texto longo e receba blocos menores, prontos para copiar." },
  { slug: "remover-silencio", group: "roteiro", title: "Remover silêncio do áudio", short: "Corte os silêncios longos de uma gravação.", intro: "Envie uma gravação e tire as pausas compridas. O arquivo não sai do seu aparelho." },

  { slug: "titulo-e-descricao", group: "publicar", start: true, title: "Título e descrição", short: "Conte os caracteres e veja como o título aparece.", intro: "Escreva o título e a descrição do vídeo e veja se cabem." },
  { slug: "hashtags-e-tags", group: "publicar", start: true, title: "Hashtags e tags", short: "Transforme palavras-chave em hashtags e tags.", intro: "Digite as palavras-chave do vídeo e copie as hashtags e tags prontas." },
  { slug: "capitulos", group: "publicar", start: true, title: "Capítulos do vídeo", short: "Monte os capítulos no formato do YouTube.", intro: "Escreva os horários e os títulos. A ferramenta confere se está tudo certo." },
  { slug: "legendas-srt", group: "publicar", title: "Legendas (.srt)", short: "Crie um arquivo de legenda a partir do texto.", intro: "Cole o texto e baixe um arquivo de legenda .srt para o seu vídeo." },
  { slug: "checklist-de-publicacao", group: "publicar", start: true, title: "Checklist de publicação", short: "Confira o que falta antes de publicar.", intro: "Marque o que já fez. Suas marcações ficam salvas neste aparelho." },

  { slug: "redimensionar-imagem", group: "imagem", start: true, title: "Redimensionar imagem", short: "Ajuste para miniatura, banner ou foto de perfil.", intro: "Envie uma imagem, escolha o tamanho e baixe pronta." },
  { slug: "miniatura", group: "imagem", start: true, title: "Criar miniatura", short: "Monte uma miniatura com texto grande e cores prontas.", intro: "Escreva o texto, escolha as cores e baixe a miniatura." },

  { slug: "calendario-semanal", group: "planejar", title: "Calendário semanal", short: "Planeje o que publicar em cada dia.", intro: "Anote uma ideia por dia da semana. Tudo fica salvo neste aparelho." },
  { slug: "calculadora-de-ganhos", group: "planejar", title: "Calculadora de ganhos", short: "Estime quanto um canal pode render por mês.", intro: "Informe as visualizações e o valor por mil para ter uma ideia." },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
