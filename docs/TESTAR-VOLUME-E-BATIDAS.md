# Como testar: Ajuste de volume e Roteiro em 4 batidas

## Ajuste de volume para o YouTube
Página: `/ferramentas/ajuste-de-volume` (plano Criador).

1. Escolha um áudio (MP3, WAV ou M4A) de até 30 minutos. Pode ser a sua narração.
2. Veja o volume medido em LUFS e o pico. Escolha o alvo: YouTube (-14), voz (-16) ou suave (-18).
3. Deixe o limitador ligado (segura os picos em -1 dB), escolha MP3 ou WAV e clique em ajustar.
4. Ouça e confira o "Agora: ... LUFS" mostrado embaixo do player.

O que conferir:
- o volume final fica a menos de 0,5 dB do alvo (no MP3 pode variar 0,1 a 0,2 dB);
- o áudio não distorce nos trechos mais fortes;
- uma narração baixinha sobe, uma música estourada desce;
- no celular, um áudio de uns 10 minutos termina sem travar a página.

Teste de referência feito no desenvolvimento: um tom de 1 kHz a -23 dBFS mediu -23,0 LUFS; depois de ajustado para -14, mediu -14,0.

## Roteiro em 4 batidas
Página: `/ferramentas/roteiro-em-4-batidas` (plano Criador).

1. Cole um roteiro inteiro. A ferramenta separa gancho, conflito, virada e resolução pela posição e por frases-chave.
2. Para separar você mesmo, ponha uma linha só com `---` entre as 4 partes.
3. Veja, em cada batida: se foi encontrada, o trecho achado, o tempo, a proporção e o que ajustar.

O que conferir:
- um roteiro seu que você acha bom recebe avisos razoáveis (é uma regra simples, pode errar);
- no modo manual, os tempos batem com a conferência na Calculadora de tempo de fala.

Para desligar: apague as linhas `ajuste-de-volume` e `roteiro-em-4-batidas` em `lib/tools.ts` e em `components/tools/ToolView.tsx`. O número de ferramentas desce sozinho.
