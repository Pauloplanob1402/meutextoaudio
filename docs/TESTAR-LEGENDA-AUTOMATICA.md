# Como testar o protótipo da Legenda automática

É uma página de teste escondida: `/prototipos/legenda`. Ela não aparece em nenhum menu, pede aos buscadores para não indexar e não mexe em nada do site público.
Objetivo: medir **quanto tempo demora** e **quão boa fica** a transcrição em português, nos seus aparelhos, antes de decidirmos se vira uma ferramenta de verdade.
O arquivo de áudio ou vídeo não sai do seu computador. Só o modelo de voz é baixado (na primeira vez) e fica salvo no navegador.

## Antes de começar (novo: uma biblioteca nova)

1. Descompacte o zip por cima da pasta do site, incluindo o arquivo `.npmrc` (começa com ponto e pode ficar escondido no Windows).
2. No Prompt de Comando, entre na pasta (troque pelo caminho real): `cd /d C:\sauim-site`
3. Instale as dependências novas: `npm install`
4. Ligue o site: `npm run dev`
5. Abra no Chrome: `http://localhost:3000/prototipos/legenda`

## Os testes

Use um vídeo ou áudio SEU, falando em português. Tenha à mão um de cerca de 1 a 2 minutos e outro de uns 5 a 10 minutos.

**Teste 1: o básico.**
1. Escolha o arquivo curto. Deixe o modelo "Médio", o processamento "Automático", o idioma "Português" e "Teste rápido" marcado.
2. Clique em "Transcrever".
3. Na primeira vez, aparece o carregamento do modelo, com a porcentagem. Depois aparece "Transcrevendo…".
4. No fim, aparecem o texto com os horários, os botões de baixar e o **Relatório de medição**.

**Teste 2: comparar o processamento.** Repita com "Só o processador". Compare os tempos do relatório.

**Teste 3: comparar os modelos.** Repita com "Pequeno" e com "Grande". Anote tempo e qualidade de cada um.

**Teste 4: segunda vez.** Rode de novo o mesmo modelo. O "Carregamento do modelo" deve ficar bem mais rápido, porque o modelo já está salvo.

**Teste 5: arquivo longo.** Desmarque "Teste rápido" e use o vídeo de 5 a 10 minutos. Veja se o navegador aguenta e quanto demora.

**Teste 6: situações difíceis (opcional).** Áudio com música de fundo, com ruído, com nomes próprios ou com sotaque forte.

**Teste 7: celular (opcional).** Só depois de publicar. Use o modelo "Pequeno" e o teste rápido.

## Como avaliar a qualidade

Para cada teste, dê uma nota de 1 a 5 e anote:
- palavras erradas e nomes próprios errados;
- pontuação e frases cortadas;
- trechos inventados em silêncio ou música (acontece com esses modelos);
- se o `.srt` baixado fica no tempo certo quando você testa no vídeo.

## O que me mandar

- o **Relatório de medição** (botão "Copiar relatório") de cada teste;
- sua nota de 1 a 5 e as observações;
- se deu erro, um print e o que aparecer em vermelho no console (tecle F12, aba "Console").

## Mensagens de erro e o que significam

- "Não consegui ler o som deste arquivo": formato que o navegador não abre. Tente MP3, WAV ou MP4 comum.
- Aviso de que a placa de vídeo (WebGPU) falhou: o protótipo trocou sozinho para o processador. Anote isso.
- "O reconhecimento de voz não conseguiu iniciar": problema no trabalhador de fundo. Me mande o texto completo da mensagem.
- Falha ao baixar o modelo: rede, bloqueio ou antivírus. Tente de novo e me avise.

## O que eu faço com os números

Com os relatórios, decidimos: qual modelo usar, o tamanho máximo do arquivo, se vale oferecer no plano grátis, e se a ferramenta final precisa da fila e do segundo plano (como o Texto em áudio). Se a transcrição for mais lenta que o áudio em computadores comuns, o caminho é limitar o tamanho e oferecer só o modelo menor.
