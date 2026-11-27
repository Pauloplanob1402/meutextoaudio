# Como testar: Vídeo narrado com legenda

Página: `/ferramentas/video-narrado` (plano Criador). Use o Chrome atualizado no computador e também o celular.

1. Escolha uma narração (por exemplo, a que você gerou no Texto em áudio).
2. Cole o texto da narração (legenda aproximada) ou o conteúdo de um .srt do Pacote do vídeo (tempo exato).
3. Escolha o formato (vertical para Shorts), o fundo (ou uma imagem sua) e a posição da legenda.
4. Clique em "Ver a prévia" para assistir na tela. Depois "Gerar o vídeo".
5. Espere terminar (leva a duração do áudio), assista e baixe.

O que conferir:
- a legenda aparece junto da fala (no modo aproximado pode adiantar ou atrasar um pouco; para tempo exato use .srt);
- o arquivo baixado abre no seu editor (CapCut, DaVinci, etc.). Se vier .webm e o editor não abrir, tente o Chrome atualizado ou o Safari (saem em MP4);
- no celular, com a tela bloqueada ou em outra aba, a gravação pode congelar: mantenha a aba aberta;
- áudio de 3 a 5 minutos grava sem travar.

Limite: 10 minutos de áudio por vídeo.

Para desligar: apague a linha `video-narrado` em `lib/tools.ts` e em `components/tools/ToolView.tsx`.
