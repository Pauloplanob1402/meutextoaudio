# Como testar: Minha voz (beta)

Página: `/ferramentas/minha-voz-beta` (plano Criador). TESTE NO COMPUTADOR, com Chrome ou Edge, internet boa e uns 500 MB livres.

1. Marque a declaração de que a voz é sua. Sem ela, os botões de gravar e enviar ficam bloqueados.
2. Clique em "Gravar", leia a frase mostrada em tom normal e clique em "Parar" (ou espere 10 s). Ouça a gravação. Se avisar que está baixa ou estourada, grave de novo.
3. Escolha "Rápida" e clique em "Preparar a minha voz". Na primeira vez baixa o modelo (uns 150 MB ou mais), com porcentagem. Depois fica salvo no navegador.
4. Escreva um texto curto e clique em "Gerar com a minha voz". Ouça e baixe em MP3 ou WAV.

O que avaliar (é isso que decide se o recurso continua):
- O sotaque é do Brasil ou de Portugal? A voz lembra a sua?
- Erra muitas palavras ou números?
- Quanto tempo leva para uma frase de 10 s? (a tela diz o quanto mais lento ou rápido que a fala)
- Teste também "Melhor qualidade" (baixa mais e é mais lenta).
- Fechando e abrindo a página, a gravação continua guardada? Funciona o botão "Apagar a gravação"?

Se der erro "Não foi possível preparar a sua voz": confira a internet, desligue bloqueadores, recarregue (F5). Se continuar, me mande a mensagem do console do navegador (F12, aba Console).

Limites do beta: texto de até 3.000 caracteres; só no plano Criador; só no computador por enquanto.

Para desligar: apague a linha `minha-voz-beta` em `lib/tools.ts` e em `components/tools/ToolView.tsx`.


## Novidade de 27/11/2026: voz salva na conta, na lista de vozes e mais rápida

ANTES: rode o bloco 6 de `supabase/schema.sql` no Supabase (SQL Editor > New query > cole > Run). Sem isso a voz não salva na conta (continua funcionando só no aparelho).

1. Logado no plano Criador, grave a voz em `/ferramentas/minha-voz-beta`. Embaixo do player deve aparecer "Salva na sua conta". No Supabase, Table Editor > `minha_voz` deve ter 1 linha sua.
2. Abra a página inicial (Texto em áudio). Na lista "Voz" deve aparecer "Sua voz · Plano Criador > Minha voz". Escolha, clique em "Gerar meu áudio". Na primeira vez baixa o modelo (uns 150 MB) e "aprende a sua voz"; depois é bem mais rápido.
3. Teste em outro aparelho ou navegador (ou limpe os dados do site): entre na conta e a "Minha voz" deve aparecer na lista sozinha.
4. "Apagar a gravação" apaga do aparelho e da conta (a linha some do Supabase) e "Minha voz" some da lista.
5. Gravação antiga (feita antes desta versão) NÃO sobe sozinha: aparece o botão "Salvar na minha conta".

Velocidade: o site agora manda os cabeçalhos COOP/COEP na página inicial, na Minha voz e em `/_next/static`, para o motor usar vários núcleos. Confira no Chrome (F12 > Console): `crossOriginIsolated` deve dar `true`. Compare o "gerado Nx mais rápido/lento que a fala" com o de antes.
Confira também que NADA quebrou: login com Google, o botão de assinar, as fontes e as vozes comuns (Faber, Cadu) na página inicial.
Se algo quebrar: crie a variável `ISOLAMENTO_THREADS=off` na Vercel e publique de novo (desliga os cabeçalhos; a voz clonada volta a ser lenta, mas o resto fica como era).


## Novidade de 27/11/2026 (2): qualidade, volume e eco

O que mudou:
- Gravação "pura": por padrão a gravação NÃO usa mais os filtros automáticos do navegador (cancelamento de eco, supressão de ruído e ganho automático). Há uma caixinha para voltar ao modo antigo. TESTE OS DOIS e fique com o que soar melhor: em lugar silencioso o puro costuma ser melhor; em lugar barulhento o antigo pode ser.
- Verificador da gravação: avisa se estourou, se está baixa, se tem muito ruído e se parece ter eco. O aviso de eco é uma ESTIMATIVA e só pega eco forte; o eco leve passa. O melhor remédio continua sendo regravar perto de cortinas, sofá ou num armário aberto.
- Acabamento do áudio gerado (Minha voz e voz clonada do Texto em áudio): filtro de graves (80 Hz) + volume em -16 LUFS com limitador suave. Resolve o volume baixo e irregular entre trechos. NÃO tira eco que já está na voz clonada.
- Motor: 2 passos de refinamento (antes 1) e temperatura 0,55 (antes 0,7), e frases de até 180 caracteres (antes 250). Os números ficam no topo de `lib/cloneEngine.ts` (`LSD_STEPS`, `TEMPERATURE`, `CHUNK_CHARS`). Se ficar lento demais, volte `LSD_STEPS` para 1.

Como comparar (faça com o MESMO texto):
1. Grave com a caixinha "pura" marcada; gere. Depois grave de novo com ela desmarcada; gere. Qual tem menos chiado metálico e menos eco?
2. "Rápida" x "Melhor qualidade".
3. Compare o volume: o áudio deve sair em torno de -16 LUFS (confira na ferramenta Ajuste de volume).


## Correção de 27/11/2026 (3): "Worker error" e modo leve automático

Sintoma visto no site publicado: "Não foi possível preparar a sua voz ... Detalhe técnico: Worker error" (o motor de voz não iniciava), mesmo na nova tentativa com 1 núcleo. Causa provável: a página isolada (COOP/COEP) só carrega o worker se o arquivo dele em `/_next/static/chunks/` também vier com o cabeçalho, e a hospedagem pode não estar mandando.
Agora, se o motor falhar na página isolada, o site recarrega a MESMA página com `?leve=1` (sem os cabeçalhos, como era antes, 1 núcleo) e guarda essa escolha neste navegador (`localStorage` chave `sauim-sem-nucleos`).
Como conferir:
1. Abra a Minha voz e prepare a voz. Se funcionar sem recarregar, e no Console `crossOriginIsolated` for `true`, os vários núcleos estão valendo.
2. Se a página recarregar sozinha com `?leve=1` na barra de endereço e a voz funcionar, a hospedagem não aceitou o worker isolado: fica no modo compatível (mais lento). Aí vale investigar o cabeçalho de `/_next/static/chunks/turbopack-worker-*.js` na aba Network (F12).
3. Para tentar de novo os vários núcleos: no Console, `localStorage.removeItem("sauim-sem-nucleos")` e abra a página sem `?leve=1`.
Desligar tudo de vez: variável `ISOLAMENTO_THREADS=off` na Vercel.


## Correção de 27/11/2026 (4): worker fora do Turbopack

Sintoma: mesmo com `?leve=1`, "Detalhe técnico: Uncaught NetworkError: Failed to execute 'importScripts' ... turbopack-....js failed to load". O worker que o Turbopack montava carregava arquivos de `/_next/static/immutable/chunks/` e falhava no site publicado.
Agora o motor é um arquivo simples em `public/pocket-tts/` (copiado de `lib/pocketTts/` por `scripts/copiar-worker-voz.mjs`, que roda sozinho no `npm run build`/`dev`) e é aberto por um worker "blob". Os arquivos de `/_next/static` voltaram a não ter nenhum cabeçalho especial.
ANTES DE TESTAR:
- Rode o bloco 6 de `supabase/schema.sql` no Supabase. Sem ele o console mostra "GET .../minha_voz 404" e a voz não salva na conta (a tela pode dizer "só neste aparelho").
- Depois de publicar, force a atualização do navegador (Ctrl + F5) para não usar a página antiga.
Como conferir: Minha voz > Preparar a minha voz. Se der certo, confira no Console `crossOriginIsolated` (true = vários núcleos). Se algo falhar, a tela mostra o "Detalhe técnico"; no F12 > Network, procure `/pocket-tts/worker.js` (deve ser 200).
