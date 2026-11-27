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

Fila atual (atualizada em 26/11/2026, depois do Minha voz (beta)), em ordem:
1. [aguardando teste do Paulo] Geração em segundo plano e Pacote de publicação, entregues em 26/11/2026. Guia: `docs/TESTAR-NOVIDADES.md`.
2. [a conferir] Limite do plano grátis (10.000 caracteres por mês, com contador visível): confirmar se já está no código e como se comporta.
3. [aguardando medição do Paulo] Protótipo da Legenda automática, entregue em 26/11/2026: página escondida `/prototipos/legenda` para medir tempo e qualidade em português. Guia: `docs/TESTAR-LEGENDA-AUTOMATICA.md`. Depois das medições, decidir o modelo, os limites e se vira ferramenta pública.
4. Estúdio de voz.
5. Mentor de Autores, fase 1 (`docs/MENTOR-DE-EBOOKS.md`).

Histórico do que já foi feito:
- 27/11/2026: **Minha voz (beta)** (a 42ª ferramenta extra, grupo "Do roteiro ao áudio", só no plano Criador): o criador aceita uma declaração de que a voz é a dele, grava 5 a 10 s no microfone (ou envia um arquivo), escolhe qualidade (rápida ou 24 camadas), prepara a voz e gera o áudio dos textos com ela, em WAV ou MP3. Tudo no aparelho, sem API externa e sem custo por uso. Usa o modelo Pocket TTS da Kyutai (CC BY 4.0, que proíbe clonar voz sem consentimento) pela biblioteca `pocket-tts-js` 0.1.0 (MIT), copiada para `lib/pocketTts/` porque o Turbopack não aceita o `import()` dinâmico dela. O modelo (uns 150 MB ou mais) baixa do Hugging Face e o motor ONNX do jsDelivr, ambos já liberados no CSP; sem hospedagem própria. Aviso de beta e de testar só no computador (Chrome/Edge) na tela, nos Termos (uso proibido de voz alheia) e na Privacidade. Correção no caminho: o `Permissions-Policy` bloqueava o microfone, agora `microphone=(self)`. Testado: gravação com microfone falso, guardar e restaurar a gravação, trava sem o aceite, erro amigável sem o modelo. NÃO testado: a geração com o modelo de verdade (o ambiente não alcança o Hugging Face nem o jsDelivr), então sotaque, qualidade e velocidade do português do Brasil estão por avaliar. Possível evolução: hospedar o modelo no próprio site, usar threads (exige cross-origin isolation, que quebraria Turnstile/Google) e ligar a voz clonada ao Texto em áudio. Guia: `docs/TESTAR-MINHA-VOZ-BETA.md`.
- 27/11/2026 (teste do Paulo na Minha voz beta): funcionou e a voz saiu boa, mas a geração é lenta (um texto de 2.390 caracteres em 18 trechos, na qualidade "Melhor"). Adicionado tempo restante estimado e dica de usar "Rápida". Ideias para acelerar, nenhuma testada: (1) comparar "Rápida" x "Melhor" e medir; (2) threads do ONNX, que exigem cross-origin isolation (COOP/COEP só nessa rota) e o worker do ONNX vindo do jsDelivr pode não funcionar assim; (3) hospedar o modelo no próprio site; (4) WebGPU, que a biblioteca atual não usa.
- 27/11/2026: **Pacote do vídeo, fase 2** (melhoria do Texto em áudio; o contador continua em 42): (1) ajuste fino pelos silêncios: ao gerar, cada trecho é medido (`lib/silencios.ts`: silêncio antes, depois e pausas no meio da fala) e a legenda e os capítulos passam a começar quando a fala começa e a trocar nas pausas reais, em vez de espalhar pelo tempo do trecho; sem as medidas, funciona como antes. (2) botão "Baixar tudo em um zip" com o áudio (na velocidade e formato escolhidos), `legenda-sauim.srt` e `capitulos-youtube.txt` (só se os capítulos não têm problemas). Para isso o download foi separado em `buildAudio()` no `Tool.tsx` (mesmo comportamento). Testado: detecção de silêncios com tons, divisão da legenda com pausa, tempos de capítulos e o zip no navegador com uma página temporária (removida). NÃO testado com voz de verdade. Guia: `docs/TESTAR-PACOTE-FASE-2.md`.
- 27/11/2026: **Amostra de 5 s da voz** (melhoria do Texto em áudio, não é uma ferramenta nova: o contador continua em 42): botão "Ouvir amostra de 5 s" ao lado de "Gerar meu áudio". Fala a primeira frase do texto da pessoa (até uns 110 caracteres, cortada no fim de uma frase) ou uma frase padrão, com a voz e a velocidade escolhidas. A criação da sessão de voz foi extraída para `openSession()` e usada pela geração e pela amostra (a geração continua igual). Vozes do plano Criador também tocam a amostra para quem não assinou (ouvir antes de assinar; a geração continua bloqueada). NÃO testada com voz de verdade (o ambiente não alcança a voz); o caminho de erro foi testado. Aguardando o teste do Paulo. Guia: `docs/TESTAR-AMOSTRA-DE-VOZ.md`.
- 26/11/2026: **Vídeo narrado com legenda** (a 41ª ferramenta extra, grupo "Do roteiro ao áudio"): a pessoa escolhe a narração, cola o texto (legenda aproximada, espalhada pela duração) ou um .srt (tempo exato), escolhe formato (vertical 9:16, horizontal 16:9 ou quadrado), fundo (4 cores ou imagem própria), legenda no centro ou embaixo e barra de progresso; vê a prévia e grava o vídeo no navegador (canvas + MediaRecorder), em tempo real, até 10 min. Sai em MP4 (H.264) onde o navegador sabe, senão WebM. Testada: um áudio de 6 s com 2 legendas virou vídeo 720x1280 com áudio e legenda legível. Limitações: grava em tempo real (aba aberta e visível), sem trocar de aba; só um fundo parado (sem cenas nem vídeo de fundo); o MP4/WebM do navegador pode não abrir em todo editor. Guia: `docs/TESTAR-VIDEO-NARRADO.md`.
- 26/11/2026: **Extrair e cortar áudio de vídeo** (a 40ª ferramenta extra, grupo "Do roteiro ao áudio"): escolhe um vídeo (MP4, MOV, WEBM) ou áudio de até 400 MB e 40 minutos, mostra a forma da onda, marca começo e fim (barras ou digitando 1:23,5), suaviza as pontas, e baixa o trecho em MP3 (128/192 kbps, estéreo ou mono) ou WAV. Testada no navegador com um MP4 de 12 s com 3 tons: o corte de 4 a 8 s deu 4,05 s a 880 Hz, o tom certo. NÃO corta nem converte o vídeo em si (isso exigiria ffmpeg no navegador; ficou como ideia). Guia: `docs/TESTAR-EXTRAIR-E-CORTAR-AUDIO.md`.
- 26/11/2026: **Audiolivro e podcast em lote** (a 39ª ferramenta extra, grupo "Do roteiro ao áudio"): texto longo vira capítulos (achados por títulos como "Capítulo 1" ou "# Título", por linhas `---` ou por tamanho de 5 a 20 min, sempre no fim de um parágrafo), cada um gerado com a voz e a velocidade escolhidas, em MP3 ou WAV, com títulos editáveis, botão de parar e continuar, e zip com arquivos numerados e um `sumario.txt` com as durações. Zip próprio sem biblioteca (testado com `unzip -t` e Python). Divisão testada; a geração de voz NÃO foi testada de ponta a ponta no desenvolvimento, porque o ambiente não alcança o Hugging Face (usa o mesmo caminho do Texto em áudio). Aguardando o teste do Paulo com uma voz de verdade. Guia: `docs/TESTAR-AUDIOLIVRO-EM-LOTE.md`.
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
4. Textos fora do site (e-mail de boas-vindas, README, planos no Mercado Pago, redes sociais) podem ter o número escrito à mão: procure por ele e atualize. Neste momento (depois do Plano da semana) o site mostra **43 ferramentas** (1 principal + 42 extras). Na próxima ferramenta, vira 44 e 43.

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
- [feita em 26/11/2026, aguardando teste do Paulo] **Pacote de publicação**: título A/B, descrição já com os capítulos, hashtags e comentário fixado, a partir do roteiro, dentro do cartão do Pacote do vídeo. Origem: Claude.
  Esforço: baixo a médio (reaproveita ferramentas que já existem).
- [nova] **Cortes para Shorts**: a partir da transcrição, sugerir os melhores trechos de 30 a 60 segundos com horários e legenda. Origem: Claude.
  Depende da Legenda automática. Esforço: médio.
- [nova] **Cortar e converter o vídeo em si** no navegador (a parte de áudio já foi feita em 26/11/2026). Origem: Claude.
  Exige ffmpeg no navegador (ffmpeg.wasm, uns 30 MB que o visitante baixa na primeira vez) e é lento em celular. Só vale se os criadores pedirem na Caixa "o que faltou hoje?". Esforço: alto.
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

- Minha voz (beta), correções: Parar de verdade (flag no componente), fila única de geração (sem mistura de vozes), clone com nome único, e a voz aparece como "Minha voz (beta)" na lista do Texto em áudio (Criador, gravação local). Lib: lib/cloneVoice.ts. Contador segue 43.
