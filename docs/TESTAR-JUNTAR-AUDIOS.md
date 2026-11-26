# Como testar: Juntar áudios e músicas

Página: `/ferramentas/juntar-audios` (plano Criador).

1. Adicione 3 ou mais arquivos (MP3, WAV ou M4A), pelo botão ou arrastando.
2. Mude a ordem com as setas ▲ ▼ ou arrastando. A ordem da lista é a ordem do áudio final.
3. Escolha "Colar direto", "Silêncio" ou "Transição suave" e o formato (MP3 128 ou 192 kbps, ou WAV).
4. Clique em "Juntar em um só áudio", ouça o resultado e baixe.

O que conferir:
- a ordem das músicas no arquivo final é a da lista;
- a duração mostrada bate com a soma (menos o tempo das transições suaves, mais o dos silêncios);
- no celular, com muitos arquivos, a página continua respondendo (limites: 20 arquivos, 60 minutos em MP3, 20 minutos em WAV);
- um arquivo M4A do celular abre (depende do navegador).

Para desligar sem afetar o resto: apague a linha `juntar-audios` em `lib/tools.ts` e em `components/tools/ToolView.tsx`. O número de ferramentas no site desce sozinho.
