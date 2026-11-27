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
