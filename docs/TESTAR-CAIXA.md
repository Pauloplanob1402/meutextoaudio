# Como testar: Caixa "o que faltou hoje?"

ANTES: no Supabase, abra o SQL Editor, cole o bloco 5 de `supabase/schema.sql` ("Caixa o que faltou hoje?") e rode. Ele cria a tabela `feedback`.

1. Abra qualquer ferramenta (plano Criador) e role até o fim: aparece "Faltou alguma coisa hoje?".
2. Escreva uma frase e clique em Enviar. Deve aparecer "Obrigado!".
3. No Supabase, abra Table Editor > feedback e confira a linha (ferramenta, texto e data).

O que conferir:
- a linha NÃO tem e-mail, usuário nem IP;
- mandar mais de 5 seguidas em 1 minuto mostra "Muitas mensagens seguidas";
- sem a tabela criada, a caixa mostra "Não foi possível enviar agora" (e nada quebra).

Para ler as respostas do mês: `select created_at, tool, message from public.feedback order by created_at desc;`

Para desligar: tire `<FeedbackBox ... />` de `app/ferramentas/[slug]/page.tsx`.
