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
