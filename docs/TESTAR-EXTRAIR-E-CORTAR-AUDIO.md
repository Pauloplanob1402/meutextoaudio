# Como testar: Extrair e cortar áudio de vídeo

Página: `/ferramentas/extrair-e-cortar-audio` (plano Criador).

1. Escolha (ou arraste) um vídeo MP4 ou MOV gravado no celular, ou um áudio.
2. Veja a forma da onda e a duração. Mova as barras de Começo e Fim, ou digite (ex.: 1:23,5).
3. Deixe "Suavizar" ligado, escolha MP3 e clique em "Cortar e gerar o áudio".
4. Ouça o resultado e baixe.

O que conferir:
- o trecho ouvido é o que a onda destacou em azul;
- a duração mostrada bate com "Trecho escolhido";
- um vídeo de celular grande (uns 300 MB) abre sem travar a página;
- um vídeo sem som mostra a mensagem de erro clara.

Limites: 400 MB e 40 minutos. Só o áudio é cortado; o vídeo em si não.

Para desligar: apague a linha `extrair-e-cortar-audio` em `lib/tools.ts` e em `components/tools/ToolView.tsx`.
