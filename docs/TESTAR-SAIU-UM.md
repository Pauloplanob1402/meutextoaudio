# Como testar: Saiu um!

Página: `/ferramentas/saiu-um` (plano Criador).

1. Escreva o nome de um vídeo (opcional) e clique em "Saiu um!" (ou aperte Enter no campo).
2. Veja o total, o mês, a semana e a sequência de semanas seguidas.
3. Mude a meta semanal (1 a 5) e veja a sequência se recalcular.
4. Remova um vídeo pela lista.

O que conferir:
- a semana vai de segunda a domingo;
- a semana em andamento sem meta batida ainda não zera a sequência;
- fechando e abrindo o navegador, os dados continuam (ficam só neste aparelho).

Para desligar: apague a linha `saiu-um` em `lib/tools.ts` e em `components/tools/ToolView.tsx`.
