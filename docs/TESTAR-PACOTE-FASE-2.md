# Como testar: Pacote do vídeo, fase 2

Página: a inicial (Texto em áudio), depois de gerar um áudio.

1. Use um roteiro com frases e vírgulas e três marcas, por exemplo `[CAPÍTULO: Introdução]`, `[CAPÍTULO: Meio]`, `[CAPÍTULO: Final]` (o YouTube pede pelo menos 3 capítulos).
2. Gere o áudio. Abaixo do player aparece o Pacote do vídeo.
3. Clique em "Baixar tudo em um zip". Abra o zip: áudio, `legenda-sauim.srt` e `capitulos-youtube.txt`.
4. Importe o áudio e o .srt no seu editor (ou no YouTube Studio) e confira a legenda.

O que conferir (a novidade é o ajuste fino):
- a primeira legenda começa quando a fala começa, não em 0:00 exato;
- em frases longas divididas em duas linhas, a segunda aparece logo depois da pausa da vírgula;
- os capítulos caem no começo da fala de cada parte;
- com velocidade diferente de normal, o zip vem na velocidade escolhida e os tempos batem com ela;
- se os capítulos têm problemas, o zip sai sem o arquivo de capítulos e avisa.

Se algo sair pior que antes: a medição só entra se houver silêncios medidos. Para voltar ao comportamento antigo, volte `meter.analyze` para `meter.measure` em `components/Tool.tsx` (linha da geração).
