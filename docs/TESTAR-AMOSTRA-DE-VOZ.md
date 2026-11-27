# Como testar: Amostra de 5 s da voz

Página: a inicial (Texto em áudio).

1. Cole um texto (ou deixe vazio para usar a frase padrão) e escolha uma voz.
2. Clique em "Ouvir amostra de 5 s". Na primeira vez a voz é baixada (demora); depois é rápido.
3. A amostra toca na velocidade escolhida na lista de velocidades (a mesma do áudio final).
4. Troque de voz e ouça de novo. Depois clique em "Gerar meu áudio" e confira que a geração completa continua normal.

O que conferir:
- a amostra fala a primeira frase do seu texto, sem cortar no meio de uma palavra;
- durante a geração do áudio, o botão da amostra fica desabilitado (e vice-versa);
- vozes do plano Criador tocam a amostra para quem não assinou, mas "Gerar" continua bloqueado;
- trocar de voz várias vezes seguidas não trava (a biblioteca guarda uma voz por vez).

Para desligar: apague o botão "Ouvir amostra de 5 s" em `components/Tool.tsx`. A função `openSession()` pode ficar.
