# Ideias para o Sauim

**Missão: tornar o Sauim a maior e a melhor plataforma do mundo para criadores de conteúdo.**

Este arquivo deve ser LIDO sempre, antes de propor ou fazer qualquer mudança no site.
Quem trabalha no projeto (o Paulo, o Claude ou qualquer pessoa da equipe) acrescenta ideias aqui e atualiza o estado delas.

## Regra de ouro

**Nenhuma ferramenta ou melhoria nova pode quebrar a engenharia do que já existe.**
Isso vale para o Texto em áudio, o login, a cobrança (cartão e Pix, mensal e anual), o webhook do Mercado Pago, os e-mails, as vozes e os limites do plano grátis.
Toda ideia nova deve:
- entrar como camada nova (arquivos e rotas novas), sem mudar o que as rotas e as tabelas atuais fazem;
- usar no banco só colunas ou tabelas novas e opcionais, e dizer qual SQL rodar ANTES de publicar;
- ter um jeito simples de desfazer (poder desligar sem afetar o resto);
- ser conferida (TypeScript e build) antes da entrega;
- ser entregue em um zip, e dizer exatamente o que mudou e o que não foi tocado.

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

- [nova] **"Saiu um!"**: um contador e uma sequência de vídeos publicados pelo criador, com um botão simples para marcar "saiu um". Origem: Claude.
  Base: Primal Branding (vocabulário e ritual próprios), Hooked (investimento), Detonando! (constância). Para quem: todo criador. Por que importa: transforma o nome do Sauim em hábito e dá um motivo para voltar toda semana. Esforço: baixo a médio.
- [nova] **Roteiro em 4 batidas**: ferramenta que guia o criador por gancho, conflito, virada e resolução, e mostra onde o roteiro está fraco. Origem: Claude.
  Base: Salve o Gato!, Story, A Fórmula do YouTube (retenção). Para quem: quem roteiriza. Por que importa: completa o Validador de gancho e o Roteiro em blocos, que hoje não cobrem o roteiro inteiro. Esforço: médio.
- [nova] **Caixa "o que faltou hoje?"**: uma pergunta de uma linha dentro das ferramentas ("Faltou alguma coisa? Conte em uma frase"), com as respostas guardadas para alimentar este arquivo todo mês. Origem: Claude.
  Base: Continuous Discovery Habits, Inspired. Para quem: todo mundo. Por que importa: o Sauim passa a ser feito com os criadores, não só para eles. Precisa de aviso na política de privacidade. Esforço: baixo a médio.

### Ordem sugerida para as 3 de novembro (em 25/11/2026)

Nenhuma das três é tão útil quanto o Texto em áudio. Por isso, a ordem mistura importância e facilidade:
1. **Caixa "o que faltou hoje?"**: é a mais fácil e isolada, e é ela que vai mostrar qual é a próxima ferramenta de verdade.
2. **"Saiu um!"**: fácil, e é a que mais combina com quem está começando, porque conta o que o criador controla (vídeos publicados), não as visualizações.
3. **Roteiro em 4 batidas**: só vale se for feito como ferramenta de verdade, analisando o roteiro de quem usa (tempo, tamanho do gancho). Se for só um modelo para preencher, vira enfeite.

### Candidata a "tão útil quanto o Texto em áudio"

- [feita, fase 1, em 25/11/2026] **Pacote do vídeo**: com um clique, o roteiro vira o áudio, a legenda .srt sincronizada e os capítulos com o tempo real. Origem: Claude.
  Base: Product-Led Growth (chegar ao "Aha!" rápido), Hooked (recompensa imediata), A Fórmula do YouTube. Para quem: todo criador que narra. Por que importa: entrega três arquivos prontos que hoje o criador faz à mão. Observação técnica: o motor de áudio já monta o áudio trecho por trecho (frases e pausas), então a duração real de cada trecho pode ser medida. Fase 1 entregue: legenda .srt com tempos reais e capítulos pelo marcador `[CAPÍTULO: Título]`, tudo no navegador, com interruptor `NEXT_PUBLIC_PACOTE=0`. Guia de testes em `docs/TESTAR-PACOTE.md`. Esforço da fase 1: médio.
  - [nova] **Pacote, fase 2**: ajuste fino achando os silêncios na onda do áudio, para a divisão de frases dentro de um trecho ficar ainda mais exata. Origem: Claude.
  - [nova] **Pacote, fase 2**: zip com áudio, legenda e capítulos (precisa de uma biblioteca pequena de zip). Origem: Claude.

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
- [nova] "Plano da semana": o criador diz quantos vídeos quer publicar e o site monta a lista de tarefas usando as ferramentas do Sauim. Origem: Claude.
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
