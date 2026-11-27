# Como testar: Audiolivro e podcast em lote

Página: `/ferramentas/audiolivro-em-lote` (plano Criador).

1. Cole um texto com 3 capítulos pequenos. Use títulos como "Capítulo 1: ..." (ou separe com uma linha só com ---).
2. Confira a lista: número, título (dá para editar) e tempo estimado de cada capítulo.
3. Escolha a voz (comece pela Faber), a velocidade e MP3, e clique em "Gerar todos os capítulos".
4. Quando terminar, ouça um arquivo pelo botão "Baixar" e clique em "Baixar zip".
5. Abra o zip: arquivos `01-...mp3`, `02-...mp3` e um `sumario.txt` com as durações.

O que conferir:
- a primeira geração baixa a voz (demora); as seguintes são rápidas;
- "Parar" interrompe e "Continuar a gerar" retoma só o que falta;
- um texto sem títulos é dividido por tamanho, sempre no fim de um parágrafo;
- se o Texto em áudio da página inicial estiver gerando, o lote espera (as duas vozes não rodam juntas);
- no celular, um texto grande leva muito tempo e a aba precisa ficar aberta.

Limites: 60 capítulos e 300 mil caracteres por lote.

Para desligar: apague a linha `audiolivro-em-lote` em `lib/tools.ts` e em `components/tools/ToolView.tsx`.
