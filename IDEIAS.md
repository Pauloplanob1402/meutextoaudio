# Ideias para o Sauim

**Missão: tornar o Sauim a maior e a melhor plataforma do mundo para criadores de conteúdo.**

Este arquivo deve ser LIDO sempre, antes de propor ou fazer qualquer mudança no site.
Quem trabalha no projeto (o Paulo, o Claude ou qualquer pessoa da equipe) acrescenta ideias aqui e atualiza o estado delas.

## O que falta fazer (LEIA SEMPRE, TODA SESSÃO)

Quem constrói as ferramentas (a IA ou uma pessoa) deve, no começo de toda sessão:
1. Ler esta seção inteira e dizer ao Paulo o que falta e qual é o próximo passo que recomenda.
2. Conferir a "Regra de ouro" abaixo e o `PADROES.md` antes de mexer em qualquer coisa.
3. Ao terminar um trabalho, atualizar esta seção: marcar o que foi feito (com a data), acrescentar o que apareceu e reordenar a fila.
4. Entregar em um zip e dizer o que mudou, o que não foi tocado e como testar.

Fila atual (atualizada em 26/11/2026, depois da Caixa "o que faltou hoje?"), em ordem:
1. [aguardando teste do Paulo] Geração em segundo plano e Pacote de publicação, entregues em 26/11/2026. Guia: `docs/TESTAR-NOVIDADES.md`.
2. [a conferir] Limite do plano grátis (10.000 caracteres por mês, com contador visível): confirmar se já está no código e como se comporta.
3. [aguardando medição do Paulo] Protótipo da Legenda automática, entregue em 26/11/2026: página escondida `/prototipos/legenda` para medir tempo e qualidade em português. Guia: `docs/TESTAR-LEGENDA-AUTOMATICA.md`. Depois das medições, decidir o modelo, os limites e se vira ferramenta pública.
4. Estúdio de voz.
5. Audiolivro e podcast em lote.
6. Mentor de Autores, fase 1 (`docs/MENTOR-DE-EBOOKS.md`).
7. Pacote do vídeo, fase 2 (ajuste por silêncios e zip).

Histórico do que já foi feito:
- 26/11/2026: **Caixa "o que faltou hoje?"** (não é uma ferramenta, então o contador continua em 39): campo de uma frase no pé de cada ferramenta (500 caracteres), anônimo, gravado na tabela `feedback` do Supabase por `/api/feedback` (só o servidor grava; sem e-mail, usuário nem IP; freio de 5 por minuto e campo-isca contra robôs). A política de privacidade ganhou a seção "A caixa o que faltou hoje?". PRECISA rodar o bloco 5 de `supabase/schema.sql` no Supabase antes de funcionar. Todo mês, ler a tabela e alimentar este arquivo. Guia: `docs/TESTAR-CAIXA.md`.
- 26/11/2026: **Plano da semana** (a 38ª ferramenta extra, grupo "Planejar"; marcada como "bom para começar"): o criador marca os dias em que sai um vídeo e recebe a lista de tarefas de cada vídeo (ideia e título, roteiro e começo, narração e volume, miniatura e descrição, publicar), distribuída nos dias anteriores, com caixinhas e atalhos para as ferramentas. Dados só no navegador; as marcas valem para a semana atual. Aguardando o teste do Paulo. Guia: `docs/TESTAR-PLANO-DA-SEMANA.md`.
- 26/11/2026: **Saiu um!** (a 37ª ferramenta extra, grupo "Planejar"; marcada como "bom para começar"): botão para marcar cada vídeo publicado, com total, mês, semana, sequência de semanas seguidas que bateram a meta (1 a 5 por semana) e gráfico das últimas 8 semanas. Dados só no navegador. Lógica da sequência testada com datas. Aguardando o teste do Paulo. Guia: `docs/TESTAR-SAIU-UM.md`.
- 26/11/2026: **Ajuste de volume para o YouTube (LUFS)** (a 36ª ferramenta extra, grupo "Do roteiro ao áudio") e **Roteiro em 4 batidas** (a 35ª extra, grupo "Do roteiro ao áudio", marcada como "bom para começar"). O ajuste mede o volume pelo padrão ITU-R BS.1770 e normaliza para -14, -16 ou -18 LUFS, com limitador suave de picos e saída em MP3 ou WAV; testado com um tom de 1 kHz a -23 dBFS, que mediu -23,0 LUFS e, depois de ajustado para -14, mediu -14,0. As 4 batidas analisam o roteiro (gancho, conflito, virada e resolução) por posição e por frases-chave, ou por partes separadas com `---`, mostrando tempo, proporção e o que ajustar. Aguardando o teste do Paulo com áudio e roteiro reais. Guia: `docs/TESTAR-VOLUME-E-BATIDAS.md`.
- 26/11/2026: **Juntar áudios e músicas** (a 34ª ferramenta extra, a 35ª contando o Texto em áudio; grupo "Do roteiro ao áudio"): junta vários arquivos na ordem da lista, com silêncio ou transição suave, e baixa em MP3 ou WAV. Testada em navegador com tons de 440, 660 e 880 Hz (duração e ordem conferidas). Aguardando o teste do Paulo com músicas reais. Guia: `docs/TESTAR-JUNTAR-AUDIOS.md`.
- 25/11/2026: Pacote do vídeo, fase 1 (legenda .srt e capítulos com tempo real), testado e aprovado pelo Paulo.

## Regra de ouro

**Nenhuma ferramenta ou melhoria nova pode quebrar a engenharia do que já existe.**
Isso vale para o Texto em áudio, o login, a cobrança (cartão e Pix, mensal e anual), o webhook do Mercado Pago, os e-mails, as vozes e os limites do plano grátis.
Toda ideia nova deve:
- entrar como camada nova (arquivos e rotas novas), sem mudar o que as rotas e as tabelas atuais fazem;
- usar no banco só colunas ou tabelas novas e opcionais, e dizer qual SQL rodar ANTES de publicar;
- ter um jeito simples de desfazer (poder desligar sem afetar o resto);
- ser conferida (TypeScript e build) antes da entrega;
- ser entregue em um zip, e dizer exatamente o que mudou e o que não foi tocado.

## Regra do contador de ferramentas (vale para TODA ferramenta nova)

**Toda vez que uma ferramenta for adicionada, o número que o site mostra tem que subir junto** (de 35 para 36, depois 37, e assim por diante). Os números "N ferramentas" e "todas as N ferramentas extras" aparecem na home, na página de ferramentas, no rodapé e nos planos. Eles são **calculados sozinhos** a partir da lista em `lib/tools.ts`, por isso:
1. Registre a ferramenta SEMPRE em `lib/tools.ts` (nome, frase, grupo) e em `components/tools/ToolView.tsx`. Sem isso o número não sobe e a página não existe.
2. Nunca escreva o número à mão em nenhum texto do site. Se precisar do número, importe `EXTRAS` ou `TOTAL` de `lib/brand.ts`.
3. Depois do build, confira se o número mudou na home, em `/ferramentas`, no rodapé e no cartão do plano Criador, e diga ao Paulo qual é o novo número.
4. Textos fora do site (e-mail de boas-vindas, README, planos no Mercado Pago, redes sociais) podem ter o número escrito à mão: procure por ele e atualize. Neste momento (depois do Plano da semana) o site mostra **39 ferramentas** (1 principal + 38 extras). Na próxima ferramenta, vira 40 e 39.

## Como usar

1. Antes de começar um trabalho, leia a lista e veja se alguma ideia ajuda no que será feito.
2. Quando surgir uma ideia nova, acrescente na categoria certa, com o modelo abaixo.
3. Ao terminar uma ideia, mude o estado para **feita** e escreva a data. Não apague: o histórico mostra o caminho.
4. Ao propor melhorias, o Claude cita as ideias desta lista que fazem sentido agora e diz por quê.
5. Os livros-guia estão em `BIBLIOTECA.md`, em 3 categorias. Toda ideia nova deve dizer em qual livro ou categoria se apoia.

Modelo de ideia:
```
- [estado] Título curto. Origem: Paulo | Claude | outra pessoa.
  Para quem: (qual criador ganha com isso). Por que importa: (uma frase). Esforço: baixo | médio | alto.
```
Estados: **nova**, **em análise**, **planejada**, **em andamento**, **feita**, **descartada** (com o motivo).

## Como escolher o que fazer primeiro

Uma ideia sobe na fila quando:
- ajuda o criador a publicar mais, melhor ou com menos esforço;
- é honesta (sem promessa falsa, sem pegadinha) e cabe na nossa política de privacidade;
- aproveita o que já temos (tudo roda no navegador, sem enviar arquivos do criador);
- dá uma razão clara para a pessoa voltar e, mais tarde, assinar;
- **entrega utilidade real**, como o Texto em áudio: um resultado concreto (arquivo, texto pronto, número) em poucos segundos. Ideia que só enfeita fica para depois das que resolvem uma tarefa.

## Rotina: 3 sugestões a cada sessão

Em toda sessão de trabalho no Sauim, a IA pode sugerir **3 melhorias ou ferramentas novas**, baseadas nos livros da `BIBLIOTECA.md` ou em **lançamentos recentes** sobre o tema (pesquisando na internet e confirmando que o livro existe). As sugestões aceitas entram nesta lista; as outras ficam como "em análise" ou "descartada", com o motivo.

## Sugestões para aplicar neste mês (novembro de 2026)


### Ordem sugerida para as 3 de novembro (em 25/11/2026)

Nenhuma das três é tão útil quanto o Texto em áudio. Por isso, a ordem mistura importância e facilidade:

### Candidata a "tão útil quanto o Texto em áudio"

- [feita, fase 1, em 25/11/2026] **Pacote do vídeo**: com um clique, o roteiro vira o áudio, a legenda .srt sincronizada e os capítulos com o tempo real. Origem: Claude.
  Base: Product-Led Growth (chegar ao "Aha!" rápido), Hooked (recompensa imediata), A Fórmula do YouTube. Para quem: todo criador que narra. Por que importa: entrega três arquivos prontos que hoje o criador faz à mão. Observação técnica: o motor de áudio já monta o áudio trecho por trecho (frases e pausas), então a duração real de cada trecho pode ser medida. Fase 1 entregue: legenda .srt com tempos reais e capítulos pelo marcador `[CAPÍTULO: Título]`, tudo no navegador, com interruptor `NEXT_PUBLIC_PACOTE=0`. Guia de testes em `docs/TESTAR-PACOTE.md`. Esforço da fase 1: médio.
  - [nova] **Pacote, fase 2**: ajuste fino achando os silêncios na onda do áudio, para a divisão de frases dentro de um trecho ficar ainda mais exata. Origem: Claude.
  - [nova] **Pacote, fase 2**: zip com áudio, legenda e capítulos (precisa de uma biblioteca pequena de zip). Origem: Claude.

### Base de tudo: geração em segundo plano

- [feita em 26/11/2026, aguardando teste do Paulo] **Tarefas que continuam enquanto a pessoa navega**: o Texto em áudio (e depois transcrição, vídeo e outras tarefas pesadas) segue rodando quando a pessoa abre outra ferramenta, com uma barra de progresso visível em todas as páginas e um aviso quando termina. Tarefas pesadas entram numa fila, uma por vez, para não travar o computador. Origem: Paulo.
  Como fazer sem mexer no motor de voz: manter o componente do Texto em áudio sempre montado na estrutura do site (fora da página) e só "encaixá-lo" na página inicial; ler o estado dele numa barra global. Limite honesto: fechar a aba ou recarregar a página encerra a tarefa, e celulares podem pausar quando o aplicativo vai para o fundo. Esforço: médio. Risco: médio (mexe na vida do componente), por isso exige teste com áudio real.

### Ferramentas candidatas de alto valor (nível Texto em áudio)

Critério: entregar um arquivo pronto, servir em todo vídeo, rodar no navegador e não prender o criador atrás de uma barreira.

- [protótipo entregue em 26/11/2026, aguardando medição] **Legenda automática (áudio ou vídeo para texto e .srt)**, com reconhecimento de voz rodando no navegador. Origem: Claude.
  Para quem: todo criador que fala no vídeo. Alimenta capítulos, cortes e o Mentor de Autores. Esforço: alto (modelo de dezenas a centenas de MB; velocidade e qualidade em português precisam ser medidas no aparelho do criador antes de prometer).
- [nova] **Estúdio de voz**: gravar no navegador, tirar ruído e silêncios, normalizar o volume para o YouTube e baixar. Origem: Claude.
  Para quem: quem grava a própria voz. Esforço: médio a alto.
- [nova] **Roteiro para vídeo narrado com legenda** (canais sem rosto e Shorts): voz do Sauim + legenda do Pacote do vídeo + imagem de fundo, exportando um arquivo de vídeo. Origem: Claude.
  Para quem: canais "dark" e quem faz Shorts. Esforço: alto (a gravação do vídeo no navegador costuma levar o tempo do próprio vídeo).
- [nova] **Audiolivro e podcast em lote**: texto longo vira capítulos, cada um em um arquivo, com zip e nomes organizados. Origem: Claude.
  Liga com o Mentor de Autores. Rever a licença da voz antes de oferecer como produto. Esforço: médio.
- [feita em 26/11/2026, aguardando teste do Paulo] **Pacote de publicação**: título A/B, descrição já com os capítulos, hashtags e comentário fixado, a partir do roteiro, dentro do cartão do Pacote do vídeo. Origem: Claude.
  Esforço: baixo a médio (reaproveita ferramentas que já existem).
- [nova] **Cortes para Shorts**: a partir da transcrição, sugerir os melhores trechos de 30 a 60 segundos com horários e legenda. Origem: Claude.
  Depende da Legenda automática. Esforço: médio.
- [nova] **Extrair áudio, cortar e converter vídeo** no navegador. Origem: Claude.
  Muita gente oferece; só vale pela integração com o resto. Esforço: médio a alto.
- [nova] **Dublagem**: roteiro em português vira legenda e voz em inglês ou espanhol. Origem: Claude.
  Alto valor, mas tradução no navegador é pesada e a qualidade precisa ser testada. Esforço: alto.
- [nova] **Pesquisa do que as pessoas procuram** para gerar ideias e títulos, pela API oficial do YouTube (exige chave e tem limite diário, e os dados passam pelo servidor). Origem: Claude.
  Esforço: médio.

### Ferramenta grande: Mentor de Autores (e-books para criadores)

- [planejada] **Mentor de Autores: do canal ao livro** (nome provisório). Algoritmo que gera a ideia do e-book, dá nota às ideias, sugere títulos, valida promessas e monta o plano de escrita e o calendário de lançamento, com um Kit pronto para baixar. Origem: Paulo.
  Documentação completa em `docs/MENTOR-DE-EBOOKS.md`. Base: StoryBrand, Palavras Mágicas, Sugarman, Ray Edwards, Mostre Seu Trabalho!, Superfans, Hooked, Product-Led Growth. Esforço: alto, em 4 fases (a fase 1 cabe em um zip).

### Fase do canal (para depois)

- [planejada] **Separar quem está começando de quem já tem canal grande**, perguntando na conta e adaptando o que o site mostra. Origem: Paulo.
  Pauta de quem está começando: não desanimar com poucas ou nenhuma visualização até criar a própria fórmula. O site deve celebrar o que o criador controla (vídeos publicados, constância, aprendizado) e mostrar o caminho, sem comparar com canais gigantes.
  Base: Mostre Seu Trabalho! (Kleon), Superfans (Flynn), Never Split the Difference (Voss, rótulos emocionais). Esforço: médio a alto.

## Voz e áudio

- [planejada] Vozes mais naturais no plano premium, com as 3 vozes do Kokoro em português do Brasil (Dora, Alex e Santa). Origem: Paulo.
  Para quem: criadores que querem narração com mais emoção. Por que importa: é o que separa o premium do resto. Esforço: alto.
- [em análise] Contador de uso visível no plano grátis ("você usou X de 10.000 caracteres este mês"). Origem: combinada na conversa Paulo + Claude.
  Para quem: quem testa o grátis. Por que importa: transparência é o nosso diferencial. Esforço: médio.
- [nova] Prévia de 5 segundos de cada voz antes de gerar o áudio inteiro. Origem: Claude.
  Para quem: todos. Por que importa: evita gerar o texto todo com a voz errada. Esforço: médio.

## Ferramentas para o criador

- [nova] Salvar os últimos roteiros e títulos na conta, para continuar de onde parou em qualquer aparelho. Origem: Claude.
  Para quem: assinantes. Por que importa: uma razão a mais para entrar na conta. Esforço: médio.
  Para quem: quem quer constância. Por que importa: transforma o conjunto de ferramentas em hábito. Esforço: médio.

## Conta e cobrança

- [nova] Avisar por e-mail alguns dias antes da renovação do plano anual no cartão. Origem: Claude.
  Para quem: assinantes do anual. Por que importa: confiança e menos pedidos de reembolso. Esforço: baixo.
- [nova] Trocar do plano mensal para o anual direto na página Minha conta. Origem: Claude.
  Para quem: assinantes mensais. Por que importa: aumenta o anual sem esforço de venda. Esforço: médio.
- [nova] E-mails de login do Supabase (confirmar cadastro e redefinir senha) em português, no tom do Sauim. Origem: Claude.
  Para quem: quem cria conta. Por que importa: primeira impressão profissional. Esforço: baixo.

## Comunidade e crescimento

- [nova] Página pública de histórias de canais que começaram pequenos usando o Sauim (com autorização de cada criador). Origem: Claude.
  Para quem: quem está começando. Por que importa: prova real, sem exagero. Esforço: médio.
- [nova] Programa de indicação: quem indica um criador ganha algo útil (por exemplo, um mês do plano). Origem: Claude.
  Para quem: assinantes. Por que importa: crescimento feito por quem já gosta do Sauim. Esforço: alto.

## Plano Estúdio (em breve)

- [planejada] Múltiplos perfis de DNA de marca, exportação em lote de roteiros, capítulos e .srt, e calendários separados por canal. Origem: Paulo.
  Para quem: quem produz em escala. Por que importa: abre um plano de valor mais alto. Esforço: alto.

## Ideias novas (acrescente aqui)

-
