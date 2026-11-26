# Como testar as novidades (geração em segundo plano e Pacote de publicação)

Não há SQL novo nem variável nova. Tempo estimado: 25 minutos. Faça na ordem e, se algo não bater, pare e me mande um print.

## Antes de começar

1. Descompacte o zip por cima da pasta do site (por exemplo `C:\sauim-site`).
2. No Prompt de Comando: `cd /d C:\sauim-site` (troque pelo caminho real) e depois `npm run dev`. Se a pasta `node_modules` não existir, rode antes `npm install`.
3. Abra `http://localhost:3000` no Chrome.
4. Tenha à mão os arquivos `docs/roteiro-longo.txt` (texto grande, para dar tempo de navegar) e `docs/roteiro-de-teste.txt`.

## Parte A: geração em segundo plano

**A1. O Texto em áudio continua igual (o mais importante).**
Na página inicial, clique em "Usar um exemplo", gere com uma voz grátis, toque e baixe o MP3. Deve ser tudo como antes. A página pode mostrar "Carregando o Texto em áudio…" por um instante antes de aparecer a caixa: isso é novo e esperado.

**A2. Navegar durante a geração.**
1. Apague o texto, cole o `roteiro-longo.txt` e clique em "Gerar meu áudio".
2. Quando aparecer "Gerando o áudio… (x de y)", clique em "Ferramentas" no menu e abra qualquer ferramenta.
3. Esperado: uma barra escura aparece embaixo da tela com o andamento e o link "Ver". O contador continua subindo.
4. Navegue por mais 2 ou 3 páginas (Nossa história, Planos...). A barra continua e o contador avança.

**A3. Terminar em outra página.**
Espere o áudio terminar sem voltar à página inicial. Esperado: a barra muda para a mensagem de pronto, com "Abrir" e "Fechar".

**A4. Abrir o resultado.**
Clique em "Abrir". Esperado: volta à página inicial, na caixa do Texto em áudio, com o player, o Pacote do vídeo e o Pacote de publicação. Baixe o MP3 e toque.

**A5. Voltar durante a geração.**
Gere de novo, saia para outra página e volte pela logo ou pelo menu "Texto em áudio". A barra some (a geração está na própria página) e o contador continua de onde estava.

**A6. O texto e o áudio ficam guardados.**
Saia da página inicial e volte. O texto digitado e o áudio pronto continuam lá (antes sumiam). Para começar do zero, use "Gerar outro texto".

**A7. Fechar a aba no meio.**
Durante uma geração, tente fechar a aba ou recarregar (F5). O navegador deve perguntar se você quer sair. Se sair, a geração se perde: é um limite que não dá para contornar.

**A8. Plano atualizado.**
Com uma conta Criador: entre na conta e volte à página inicial sem recarregar. As vozes do plano devem estar liberadas. Saia da conta e volte: devem voltar a ficar travadas.

**A9. Celular (opcional).**
Gere e abra outra página. A barra deve aparecer. Se você bloquear a tela ou trocar de aplicativo, o celular pode pausar a geração: é esperado.

## Parte B: Pacote de publicação

1. Cole o `roteiro-de-teste.txt`, deixe a velocidade em "Normal" e gere o áudio.
2. Abaixo do Pacote do vídeo aparece o "Pacote de publicação".
3. Em "Assunto do vídeo", escreva `narração em casa`. Os títulos devem passar a falar de "narração em casa".
4. Confira cada bloco:
   - **Títulos para testar:** 3 opções, cada uma com o tamanho em caracteres. "Usar na descrição" troca a descrição de baixo.
   - **Descrição pronta:** começa com o título escolhido, traz o resumo do roteiro e o bloco "Capítulos:" com os mesmos horários do cartão de cima, e termina com o convite e as hashtags. O contador mostra "x de 5.000 caracteres".
   - **Hashtags:** de 1 a 5, todas começando com `#`.
   - **Comentário fixado:** uma pergunta e a frase dizendo que os capítulos estão na descrição.
5. Clique nos botões "Copiar" e cole no Bloco de Notas para ver se copiou.
6. Preencha "Nome do canal" e "Link": o convite e o link entram na descrição. O nome do canal e o link ficam guardados também na ferramenta "Descrição a partir do roteiro".
7. Gere sem marcas de capítulo (use o exemplo do site): a descrição sai sem o bloco "Capítulos:".

## Testes automáticos (opcional)

`npx tsx scripts/testar-publicacao.ts` e `npx tsx scripts/testar-pacote.ts` devem terminar com "Todos os testes passaram."

## Se algo der errado

Volte ao zip anterior (`sauim-site-pacote-do-video.zip`): ele não tem estas duas novidades e continua funcionando. Me mande:
- um print da tela e da barra;
- o que apareceu em vermelho no console (F12, aba "Console");
- o texto usado, a voz e o passo do teste em que parou.
