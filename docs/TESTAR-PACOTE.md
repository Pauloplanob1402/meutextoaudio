# Como testar o Pacote do vídeo (passo a passo)

O Pacote do vídeo é o cartão que aparece embaixo do player, depois de gerar o áudio. Ele entrega a legenda (.srt) e os capítulos do YouTube com os tempos reais do áudio.
Não precisa rodar SQL nem criar variável nova. Ele já vem ligado.

Tempo estimado: 20 minutos. Faça os testes na ordem. Se algo não bater, pare e me mande um print.

## Antes de começar: abrir o site no seu computador

1. Descompacte o zip numa pasta, por exemplo `C:\sauim-site`. Se você já tem a pasta do site, copie os arquivos novos por cima (o zip inclui o projeto inteiro).
2. Abra o Prompt de Comando e entre na pasta (troque pelo caminho real da sua pasta):
   `cd /d C:\sauim-site`
3. Só se a pasta `node_modules` não existir: `npm install`
4. Use o mesmo arquivo `.env.local` que você já usa (copie para dentro da pasta, se estiver faltando).
5. Ligue o site: `npm run dev`
6. Abra no Chrome: `http://localhost:3000`

## Teste 1: o áudio continua igual (o mais importante)

1. Na caixa de texto, clique em "Usar um exemplo".
2. Escolha uma voz grátis e clique em "Gerar meu áudio".
3. Toque o áudio e baixe o MP3.

Esperado: tudo igual ao que você já conhecia. Se o áudio não gerar, pare aqui e me avise: é o único problema grave possível.

## Teste 2: o cartão aparece

1. Apague o texto. Abra o arquivo `docs/roteiro-de-teste.txt`, copie tudo e cole na caixa.
2. Clique em "Normal" nas velocidades (depois que o áudio estiver pronto) e deixe em 1×.
3. Gere o áudio com uma voz grátis.

Esperado: abaixo do player aparece o cartão "Pacote do vídeo", antes do bloco "Gostou? Indique o Sauim...".

## Teste 3: conferir a legenda

1. Clique em "Baixar legenda (.srt)" e abra o arquivo no Bloco de Notas.
2. Confira:
   - O arquivo começa com `1`, depois `00:00:00,000 --> 00:00:..,...` e o texto.
   - Não aparece nenhum "[CAPÍTULO". As marcas não são lidas nem escritas.
   - Aparecem `R$ 39,90` e `17%` do jeito certo.
   - Nenhuma linha passa de 42 caracteres, e cada legenda tem no máximo 2 linhas.
3. Compare o fim: o horário final da última legenda deve ser quase igual à duração do áudio no player (diferença de até 1 segundo).
4. Compare a pausa: entre "...tudo certo por aqui." e "Agora começa o primeiro passo." deve haver cerca de 3 segundos sem legenda (por causa do `[PAUSA 3]`).

## Teste 4: conferir os capítulos

1. No cartão, olhe a lista de capítulos. Esperado: 4 linhas, a primeira `0:00 Introdução`, depois `Primeiro passo`, `Segundo passo` e `Conclusão`, com horários crescentes.
2. Arraste o player até cada horário e toque. Você deve ouvir o começo daquela parte (por exemplo, "Agora começa o primeiro passo"). Margem aceitável: 1 segundo.
3. Clique em "Copiar capítulos" e cole no Bloco de Notas para ver se copiou.

## Teste 5: velocidade

1. Clique em "Mais rápido". O texto do cartão deve passar a dizer "velocidade 1,2×" e os horários dos capítulos ficam menores.
2. Marque "Usar os tempos do áudio na velocidade original": os horários voltam aos de antes.
3. Desmarque, clique em "Baixar MP3" (na velocidade 1,2×) e abra o arquivo baixado num player (VLC ou Windows Media). Vá até o horário de um capítulo: deve começar ali, com margem de 1 segundo.

## Teste 6: sem capítulos

1. Clique em "Gerar outro texto" e use o exemplo do site, sem marcas.
2. Esperado: o cartão mostra a legenda e uma dica explicando como escrever `[CAPÍTULO: Título]`.

## Teste 7 (opcional): vídeo de verdade

1. Em um editor de vídeo (o que você usa) ou no YouTube Studio, importe o MP3 e o arquivo .srt. No YouTube Studio, procure a opção de legendas, adicione um idioma e carregue o arquivo (com tempo). Os nomes dos menus podem mudar.
2. Toque e confira se cada legenda aparece quando a frase é dita.

## Teste 8 (opcional): voz natural

Com o plano Criador, gere com Dora, Alex ou Santa. O cartão deve aparecer do mesmo jeito.

## Teste 9 (opcional): desligar o recurso

1. No `.env.local`, escreva `NEXT_PUBLIC_PACOTE=0`, pare o site (Ctrl + C) e rode `npm run dev` de novo.
2. Gere um áudio: o cartão não deve aparecer e o áudio sai normal.
3. Para ligar de novo, apague a linha (ou deixe vazia) e reinicie.
Na Vercel é igual: crie a variável `NEXT_PUBLIC_PACOTE` com 0 e publique de novo (Redeploy).

## Teste automático (opcional)

`npx tsx scripts/testar-pacote.ts` deve terminar com "Todos os testes passaram."

## Se algo der errado, me mande

- um print do cartão;
- o arquivo .srt baixado;
- o roteiro usado, a voz e a velocidade;
- o que apareceu em vermelho no console (tecle F12, aba "Console").

## Publicar

Com tudo certo, publique do jeito que você já faz (GitHub e Vercel). Não há SQL novo nem variável obrigatória.
