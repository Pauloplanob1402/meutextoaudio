# Testar: "Faça parte" e convite nas ferramentas em beta
1. Abra /ferramentas/minha-voz-beta: no pé da página aparece "Esta ferramenta ainda está sendo construída. Venha construir junto." com a lista de áreas e o botão "Quero ajudar".
2. Escolha uma área e clique: o programa de e-mail abre para contato@sauim.com.br, com o título "[Ajudar: Minha voz (beta)] <área>" e as 5 perguntas no corpo.
3. Abra /talentos (também no rodapé, "Faça parte"): escolha ferramenta, área e formato e abra o e-mail.
4. Ferramentas sem a marca beta não mostram o convite.
Hoje são beta: Minha voz, Audiolivro em lote, Extrair e cortar áudio e Vídeo narrado. Para marcar outra ferramenta como beta: em lib/tools.ts, adicione `beta: true` nela.
Nada é guardado em servidor: é só um link de e-mail.
