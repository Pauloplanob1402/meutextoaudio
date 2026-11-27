// Lista das ferramentas extras. Para adicionar uma nova: crie o componente em
// components/tools, registre em components/tools/ToolView.tsx e inclua aqui.
//
// Como as palavras foram escolhidas:
// - nomes que a pessoa já digitaria no Google ("gerador de capítulos", "contador de título")
// - frases curtas, com verbo no começo e sem jargão (cole, veja, baixe, confira)
// - só promessas que o site cumpre de verdade (grátis, sem cadastro, nada sai do aparelho)

export type GroupId = "ideias" | "roteiro" | "publicar" | "imagem" | "planejar";

export type ToolInfo = {
  slug: string; // o endereço da página: não mude depois de publicar
  title: string;
  short: string; // frase curta do cartão
  intro: string; // frase no topo da página da ferramenta
  group: GroupId;
  start?: boolean; // "Bom para começar"
};

export const GROUPS: { id: GroupId; title: string; hint: string }[] = [
  { id: "ideias", title: "Ideias para o próximo vídeo", hint: "Quando faltar assunto, comece por aqui." },
  { id: "roteiro", title: "Do roteiro ao áudio", hint: "Prepare o texto e deixe o som limpo." },
  { id: "publicar", title: "Antes de publicar", hint: "Título, capítulos, legendas e uma última conferência." },
  { id: "imagem", title: "Miniaturas e imagens", hint: "No tamanho certo, sem abrir programa nenhum." },
  { id: "planejar", title: "Planejamento", hint: "Organize a semana e faça as contas." },
];

export const TOOLS: ToolInfo[] = [
  { slug: "banco-de-ideias", group: "ideias", start: true, title: "Banco de ideias", short: "Anote as ideias de vídeo na hora e escolha depois.", intro: "Guarde as ideias que aparecem fora de hora, separe por etiquetas e leve a escolhida para o painel ou o calendário." },
  { slug: "ideias-de-video", group: "ideias", start: true, title: "Ideias de vídeo por assunto", short: "Ideias de formato, título de exemplo e como começar, em 9 assuntos.", intro: "Escolha um assunto e veja ideias de vídeo com título de exemplo e uma sugestão de como começar." },
  { slug: "gerador-de-titulos", group: "ideias", start: true, title: "Gerador de títulos", short: "Preencha as lacunas e veja títulos prontos, por tipo de gatilho.", intro: "Responda 3 perguntas e receba títulos por tipo: curiosidade, lista, passo a passo, alerta e mais. Edite, copie e guarde os melhores." },
  { slug: "limpador-de-roteiro", group: "roteiro", start: true, title: "Limpador de roteiro para falar", short: "Deixe o texto do jeito que se fala: números, siglas e frases longas.", intro: "Cole o roteiro e a ferramenta arruma números, abreviações e símbolos, e aponta o que fica difícil de ouvir." },
  { slug: "teleprompter", group: "roteiro", title: "Teleprompter", short: "O roteiro rola na tela enquanto você grava, na sua velocidade.", intro: "Cole o roteiro, escolha a velocidade e o tamanho da letra e leia olhando para a câmera." },
  { slug: "playbooks", group: "roteiro", start: true, title: "Playbooks de vídeo", short: "Estruturas prontas de vídeo: preencha as lacunas e leve para o roteiro.", intro: "Escolha uma estrutura que os canais usam, preencha as lacunas e receba o roteiro em blocos." },
  { slug: "validador-de-gancho", group: "roteiro", start: true, title: "Validador de gancho", short: "Marque o que o começo do vídeo faz e veja a nota de 0 a 100.", intro: "Confira se os primeiros segundos do vídeo prendem a atenção e veja o que falta." },
  { slug: "roteiro-em-blocos", group: "roteiro", start: true, title: "Roteiro em blocos com tempo", short: "Gancho, contexto, corpo, clímax e chamada final, com o tempo de cada um.", intro: "Escreva cada parte do roteiro e veja quanto tempo ela dura falada." },
  { slug: "tempo-de-fala", group: "roteiro", title: "Calculadora de tempo de fala", short: "Cole o roteiro e veja quanto tempo ele dura falado.", intro: "Cole o roteiro e descubra a duração do vídeo antes de gravar." },
  { slug: "dividir-texto", group: "roteiro", title: "Divisor de texto", short: "Quebre um texto longo em blocos, sem cortar frases.", intro: "Cole um texto longo e copie os blocos, um de cada vez." },
  { slug: "juntar-audios", group: "roteiro", title: "Juntar áudios e músicas", short: "Una vários áudios ou músicas em um arquivo só, na ordem que você escolher.", intro: "Adicione os arquivos, ajuste a ordem e baixe tudo em um áudio só. Os arquivos não saem do seu aparelho." },
  { slug: "roteiro-em-4-batidas", group: "roteiro", start: true, title: "Roteiro em 4 batidas", short: "Confira se o roteiro tem gancho, conflito, virada e resolução, e quanto tempo cada parte ocupa.", intro: "Cole o roteiro e veja se as 4 batidas estão lá, com tempo de cada uma e o que ajustar. Nada sai do seu aparelho." },
  { slug: "ajuste-de-volume", group: "roteiro", title: "Ajuste de volume para o YouTube", short: "Meça o volume em LUFS e ajuste o áudio para o padrão do YouTube, com limitador de picos.", intro: "Escolha o áudio, veja o volume real e baixe uma versão ajustada. O áudio não sai do seu aparelho." },
  { slug: "audiolivro-em-lote", group: "roteiro", title: "Audiolivro e podcast em lote", short: "Um texto longo vira vários capítulos em áudio, com nomes organizados e tudo em um zip.", intro: "Cole o livro, o curso ou a série de episódios. O Sauim separa os capítulos, gera cada um e entrega tudo numerado em um zip. A voz roda no seu aparelho." },
  { slug: "extrair-e-cortar-audio", group: "roteiro", title: "Extrair e cortar áudio de vídeo", short: "Tire o áudio de um vídeo, corte o trecho que quer e baixe em MP3 ou WAV.", intro: "Escolha um vídeo ou áudio, marque o começo e o fim e baixe só o trecho. Tudo acontece no seu aparelho." },
  { slug: "remover-silencio", group: "roteiro", title: "Removedor de silêncio de áudio", short: "Tire as pausas longas da sua gravação.", intro: "Envie a gravação e corte os silêncios longos. O arquivo não sai do seu aparelho." },

  { slug: "titulo-e-descricao", group: "publicar", start: true, title: "Contador de título e descrição", short: "Veja se o título cabe e como ele aparece.", intro: "Escreva o título e a descrição e confira se cabem antes de publicar." },
  { slug: "testador-de-titulos", group: "publicar", start: true, title: "Testador de títulos", short: "Dê uma nota de 0 a 100 para até 5 títulos e veja o que melhorar.", intro: "Digite as opções de título. A ferramenta dá uma nota por regras de forma e mostra o que ajustar." },
  { slug: "descricao-do-roteiro", group: "publicar", start: true, title: "Descrição do roteiro", short: "Do roteiro à descrição do vídeo, com frase de abertura forte, pronta para copiar.", intro: "Cole o roteiro e receba três descrições com a frase de abertura no topo. Escolha o tamanho, até 5.000 caracteres." },
  { slug: "gerador-de-descricao", group: "publicar", start: true, title: "Gerador de descrição", short: "Preencha os campos e copie a descrição completa do vídeo.", intro: "Preencha o resumo, os capítulos e os links. A descrição sai montada na ordem certa." },
  { slug: "hashtags-e-tags", group: "publicar", start: true, title: "Gerador de hashtags e tags", short: "Digite as palavras-chave e copie tudo pronto.", intro: "Digite as palavras-chave do vídeo e copie as hashtags e as tags prontas." },
  { slug: "capitulos", group: "publicar", start: true, title: "Gerador de capítulos para YouTube", short: "Monte os capítulos e confira se o YouTube vai aceitar.", intro: "Escreva os horários e os títulos. A ferramenta confere se está no formato certo." },
  { slug: "conversor-de-legenda", group: "publicar", title: "Conversor de legenda", short: "Troque .srt por .vtt ou texto puro e acerte o atraso.", intro: "Envie uma legenda, escolha o formato e baixe pronta. Dá para atrasar ou adiantar tudo." },
  { slug: "links-com-tempo", group: "publicar", title: "Links com tempo", short: "Gere links que abrem o vídeo no minuto exato.", intro: "Cole o endereço do vídeo e os horários. Receba os links prontos para a descrição ou para responder comentários." },
  { slug: "legendas-srt", group: "publicar", title: "Gerador de legendas (.srt)", short: "Transforme o roteiro em um arquivo de legenda.", intro: "Cole o roteiro e baixe a legenda em .srt para colocar no vídeo." },
  { slug: "checklist-de-publicacao", group: "publicar", start: true, title: "Checklist de lançamento", short: "Confira tudo antes de publicar e suba de nível a cada item.", intro: "Marque o que já fez e veja seu nível subir. Suas marcações ficam salvas neste aparelho." },

  { slug: "qr-code-do-canal", group: "imagem", title: "QR code do canal", short: "QR code do seu canal ou vídeo, em PNG ou SVG.", intro: "Cole o endereço e baixe um QR code que leva direto ao canal, até pedindo a inscrição." },
  { slug: "redimensionar-imagem", group: "imagem", start: true, title: "Redimensionador de imagem", short: "Deixe a imagem no tamanho da miniatura, do banner ou da foto.", intro: "Envie uma imagem, escolha o tamanho e baixe pronta." },
  { slug: "miniatura", group: "imagem", start: true, title: "Criador de miniatura", short: "Texto grande, cores prontas, 1280×720.", intro: "Escreva o texto, escolha as cores e baixe a miniatura no tamanho do YouTube." },

  { slug: "simulador-de-ctr", group: "imagem", start: true, title: "Simulador de miniatura e título", short: "Veja como miniatura e título aparecem no YouTube, no computador e no celular.", intro: "Envie a miniatura, digite até 3 títulos e compare como eles aparecem antes de publicar." },
  { slug: "saiu-um", group: "planejar", start: true, title: "Saiu um!", short: "Marque cada vídeo publicado e acompanhe sua sequência de semanas seguidas.", intro: "Um botão simples para cada vídeo que sai. Veja o total, o mês, a semana e a sequência. Os dados ficam no seu aparelho." },
  { slug: "plano-da-semana", group: "planejar", start: true, title: "Plano da semana", short: "Escolha os dias de publicar e receba as tarefas de cada vídeo, dia a dia.", intro: "Marque os dias em que sai um vídeo e veja a lista de tarefas da semana, com um atalho para a ferramenta de cada etapa." },
  { slug: "painel-do-video", group: "planejar", start: true, title: "Painel do vídeo", short: "Leve cada vídeo da ideia à revisão, etapa por etapa.", intro: "Cada vídeo anda pelas mesmas 8 etapas, do jeito que os canais grandes trabalham. Crie um vídeo e siga o passo a passo." },
  { slug: "revisao-do-video", group: "planejar", start: true, title: "Revisão do vídeo", short: "Digite os números do YouTube Studio e veja o que ajustar no próximo vídeo.", intro: "Coloque os números do vídeo depois de uma semana. A ferramenta mostra se o problema está no título e na miniatura ou no conteúdo." },
  { slug: "planejador-de-serie", group: "planejar", start: true, title: "Planejador de série", short: "Transforme um tema em uma série de episódios com datas.", intro: "Escolha um tema e quantos episódios quer. Veja a grade pronta, com título, gancho e datas, e envie para o painel e para o calendário." },
  { slug: "desafio-30-dias", group: "planejar", start: true, title: "Desafio de 30 dias", short: "Uma missão por dia, quatro vídeos publicados no final.", intro: "Siga uma missão por dia e chegue ao fim com 4 vídeos publicados. Marque o que concluiu e ganhe selos." },
  { slug: "calculadora-de-frequencia", group: "planejar", title: "Calculadora de frequência", short: "Descubra quantos vídeos cabem por semana e quando chega a sua meta.", intro: "Informe seu tempo e sua meta de inscritos para ver o ritmo possível e a data estimada." },
  { slug: "dna-de-marca", group: "planejar", title: "Construtor de DNA de marca", short: "Um passo a passo de 7 etapas para definir a identidade do canal.", intro: "Responda 7 perguntas guiadas e leve para casa o resumo da identidade do seu canal." },
  { slug: "calendario", group: "planejar", title: "Calendário de conteúdo", short: "Veja o mês inteiro e anote o que publicar em cada dia.", intro: "Clique em um dia e anote a ideia. Tudo fica salvo neste aparelho." },
  { slug: "calculadora-de-ganhos", group: "planejar", title: "Calculadora de ganhos do YouTube", short: "Estime quanto um canal pode render por mês.", intro: "Informe as visualizações e o valor por mil para ter uma ideia." },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
