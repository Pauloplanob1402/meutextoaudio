# Testar: página /colorir (livro de colorir)
1. Abra /colorir (também no rodapé, "Livro de colorir"): 17 miniaturas, botão do PDF completo e botão por página. O número de páginas (faixa azul no topo, home e /colorir) é calculado de `lib/colorir.ts`.
2. Baixe o PDF e um PNG; imprima uma página e confira se o endereço www.sauim.com.br aparece embaixo.
3. Clique em "Compartilhar ou copiar a frase": no celular abre o compartilhar; no computador copia a frase com a hashtag #ColoreComOSauim.
4. Arquivos ficam em public/colorir/. Para acrescentar uma página: ponha o desenho (do Gemini, sem texto) em `scripts/colorir/originais/`, inclua uma linha em `PAGINAS` no `scripts/colorir/gerar-paginas.py` (arquivo, nome final, título, frase) e rode `python3 scripts/colorir/gerar-paginas.py`; depois inclua o nome em `lib/colorir.ts` e rode `python3 scripts/colorir/gerar-pdf.py` para refazer o PDF. (Precisa de `pip install pillow numpy img2pdf`.)
5. Não é uma ferramenta: o contador de ferramentas não muda. Não coleta dado nenhum.

## Novidade de 28/11/2026: 7 páginas novas (livro com 17 páginas)
Páginas: Castelo de areia, Jardim das borboletas, Passeio de patinete, O pequeno artista, Montando a alegria, Bolhas de sabão e Caça ao tesouro (entram antes da última, "Você é especial!").
Cada uma tem título no topo, uma frase afetiva embaixo da arte ("Fiz para a mamãe...", "Pintei para você...", "Pintei para o papai...", alegria) e www.sauim.com.br no rodapé, como as outras.
Confira: (1) imprima 2 ou 3 páginas e veja se o traço fecha bem para pintar; (2) o PDF tem 17 páginas; (3) em "O pequeno artista" a tela do cavalete está vazia de propósito: a frase convida a criança a desenhar nela; (4) as páginas com cena cortada pela borda (Jardim, Passeio, Montando a alegria) ganharam uma moldura arredondada para fechar as linhas.
