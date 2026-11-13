// Lista das ferramentas extras. Para adicionar uma nova: crie o componente em
// components/tools, registre em components/tools/ToolView.tsx e inclua aqui.
//
// Como as palavras foram escolhidas:
// - nomes que a pessoa já digitaria no Google ("gerador de capítulos", "contador de título")
// - frases curtas, com verbo no começo e sem jargão (cole, veja, baixe, confira)
// - só promessas que o site cumpre de verdade (grátis, sem cadastro, nada sai do aparelho)

export type GroupId = "roteiro" | "publicar" | "imagem" | "planejar";

export type ToolInfo = {
  slug: string; // o endereço da página: não mude depois de publicar
  title: string;
  short: string; // frase curta do cartão
  intro: string; // frase no topo da página da ferramenta
  group: GroupId;
  start?: boolean; // "Bom para começar"
};

export const GROUPS: { id: GroupId; title: string; hint: string }[] = [
  { id: "roteiro", title: "Do roteiro ao áudio", hint: "Prepare o texto e deixe o som limpo." },
  { id: "publicar", title: "Antes de publicar", hint: "Título, capítulos, legendas e uma última conferência." },
  { id: "imagem", title: "Miniaturas e imagens", hint: "No tamanho certo, sem abrir programa nenhum." },
  { id: "planejar", title: "Planejamento", hint: "Organize a semana e faça as contas." },
];

export const TOOLS: ToolInfo[] = [
  { slug: "tempo-de-fala", group: "roteiro", title: "Calculadora de tempo de fala", short: "Cole o roteiro e veja quanto tempo ele dura falado.", intro: "Cole o roteiro e descubra a duração do vídeo antes de gravar." },
  { slug: "dividir-texto", group: "roteiro", title: "Divisor de texto", short: "Quebre um texto longo em blocos, sem cortar frases.", intro: "Cole um texto longo e copie os blocos, um de cada vez." },
  { slug: "remover-silencio", group: "roteiro", title: "Removedor de silêncio de áudio", short: "Tire as pausas longas da sua gravação.", intro: "Envie a gravação e corte os silêncios longos. O arquivo não sai do seu aparelho." },

  { slug: "titulo-e-descricao", group: "publicar", start: true, title: "Contador de título e descrição", short: "Veja se o título cabe e como ele aparece.", intro: "Escreva o título e a descrição e confira se cabem antes de publicar." },
  { slug: "hashtags-e-tags", group: "publicar", start: true, title: "Gerador de hashtags e tags", short: "Digite as palavras-chave e copie tudo pronto.", intro: "Digite as palavras-chave do vídeo e copie as hashtags e as tags prontas." },
  { slug: "capitulos", group: "publicar", start: true, title: "Gerador de capítulos para YouTube", short: "Monte os capítulos e confira se o YouTube vai aceitar.", intro: "Escreva os horários e os títulos. A ferramenta confere se está no formato certo." },
  { slug: "legendas-srt", group: "publicar", title: "Gerador de legendas (.srt)", short: "Transforme o roteiro em um arquivo de legenda.", intro: "Cole o roteiro e baixe a legenda em .srt para colocar no vídeo." },
  { slug: "checklist-de-publicacao", group: "publicar", start: true, title: "Checklist de publicação", short: "Confira o que falta antes de apertar publicar.", intro: "Marque o que já fez. Suas marcações ficam salvas neste aparelho." },

  { slug: "redimensionar-imagem", group: "imagem", start: true, title: "Redimensionador de imagem", short: "Deixe a imagem no tamanho da miniatura, do banner ou da foto.", intro: "Envie uma imagem, escolha o tamanho e baixe pronta." },
  { slug: "miniatura", group: "imagem", start: true, title: "Criador de miniatura", short: "Texto grande, cores prontas, 1280×720.", intro: "Escreva o texto, escolha as cores e baixe a miniatura no tamanho do YouTube." },

  { slug: "calendario-semanal", group: "planejar", title: "Planejador semanal", short: "Uma ideia por dia, sem complicação.", intro: "Anote uma ideia por dia da semana. Tudo fica salvo neste aparelho." },
  { slug: "calculadora-de-ganhos", group: "planejar", title: "Calculadora de ganhos do YouTube", short: "Estime quanto um canal pode render por mês.", intro: "Informe as visualizações e o valor por mil para ter uma ideia." },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
