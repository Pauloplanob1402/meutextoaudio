# Testar: botões de e-mail em /talentos ("Faça parte") e no pé das ferramentas beta

Problema: o botão "Abrir o e-mail já preenchido" era um link `mailto:`. Ele só funciona se o computador tiver um programa de e-mail configurado (Outlook, Mail, Thunderbird). Em muita gente (Windows com Gmail só pelo navegador) o clique não fazia nada.

Agora há 4 caminhos, sempre visíveis (componente `components/HelpMailButtons.tsx`, textos em `lib/talentos.ts`):
1. **Abrir o e-mail já preenchido** (programa de e-mail do aparelho; é o que existia).
2. **Abrir no Gmail** (abre a tela de escrever do Gmail em outra aba, já com destinatário, assunto e texto).
3. **Abrir no Outlook** (Outlook.com / Hotmail, em outra aba).
4. **Copiar o texto** (copia "Para, Assunto e corpo" para colar em qualquer e-mail; aparece "Copiado!" embaixo).
Embaixo dos botões o endereço contato@sauim.com.br fica escrito, para quem preferir escrever sozinho.

Como testar (faça no computador do Paulo):
1. Abra /talentos, escolha "Quero ajudar em" e "Minha área" e clique em cada botão:
   - Gmail: abre o Gmail com Para = contato@sauim.com.br, assunto `[Ajudar: ...] <área>` e as 5 perguntas no texto (precisa estar logado no Gmail).
   - Outlook: o mesmo no Outlook.com.
   - Copiar o texto: cole no Bloco de notas e confira.
   - Primeiro botão: abre o programa de e-mail, ou nada se não houver um (por isso existem os outros).
2. Mude a "Minha área" e confira que o assunto muda nos três caminhos.
3. Abra uma ferramenta marcada como beta (por exemplo Audiolivro em lote) e confira os mesmos botões no pé da página ("Quero ajudar").
4. No celular, o primeiro botão abre o aplicativo de e-mail; o Gmail abre no navegador ou no app.

Não coletamos nada: o site só monta o link ou copia o texto no aparelho.
Fora de escopo, mesma limitação: o link "Contato" do rodapé e o e-mail das páginas legais ainda são `mailto:`.
