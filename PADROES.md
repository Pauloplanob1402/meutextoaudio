# Padrões do Sauim

Estas medidas e decisões valem SEMPRE, a não ser que o Paulo diga, na conversa, que a medida deve ser outra.
Antes de mexer no site, leia este arquivo e o `IDEIAS.md`.

## 1. Mascote (topo da home e da página /historia)

As duas páginas usam o mesmo componente (`components/Mascote.tsx`) e o mesmo CSS (`.sa-mascote`, em `app/sauim.css`).
Por isso o Sauim fica sempre do mesmo tamanho e à mesma distância do topo.

| Medida | Valor padrão |
|---|---|
| Largura máxima da imagem (computador) | 645 px |
| Altura aproximada do mascote (computador) | 438 px |
| Espaço do menu até a imagem | 28 px no computador, 16 px no celular (`.sa-hero` e `.hi-hero`) |
| Celular (até 520 px) | largura total da tela, margem lateral de -8 px |
| Margem abaixo da imagem | 20 px |
| Imagem da home | `public/marca/mascote-home.jpg` e `.webp` (888 x 719 px) |
| Imagem da história | `public/marca/mascote-historia.jpg` e `.webp` (888 x 750 px) |
| Suavização das bordas | máscara no CSS; a história usa `--fim:98%` para não apagar o logo |

Regras:
- Não troque a largura, a altura, o espaço do topo nem as imagens sem o Paulo pedir.
- Se uma página nova tiver mascote, gere a imagem no MESMO molde: mesmo tamanho do Sauim, mesma posição do cabelo e dos pés, 888 px de largura. Use `mascote-home.jpg` como referência de alinhamento. Depois use `<Mascote variante="..." />`.
- Para mudar o tamanho das duas ao mesmo tempo, mude só `max-width:645px` na regra `.sa-mascote`.

## 2. Livros-guia (sempre seguir)

Os livros estão em `BIBLIOTECA.md`, em 3 categorias:
- **Textos** (site, botões, e-mails, mensagens, páginas legais): sempre seguir livros de texto e persuasão (categoria B) e outros do mesmo tipo.
- **Construção da plataforma** (telas, fluxos, planos, crescimento, comunidade): sempre seguir livros de produto, UX, crescimento e comunidade (categoria C) e outros do mesmo tipo.
- **Ferramentas e conteúdo para o criador:** usar os livros de YouTube, narrativa e marca (categoria A).
- Em toda sessão, a IA pode sugerir 3 melhorias ou ferramentas novas com base nesses livros ou em lançamentos recentes. As ideias aceitas vão para o `IDEIAS.md`.
- Persuasão só com fatos reais: sem escassez falsa, sem promessa que o produto não cumpre.

## 3. Outras decisões já tomadas

- **Nenhuma ferramenta ou melhoria nova pode quebrar a engenharia do que já existe** (regra de ouro, detalhada no `IDEIAS.md`).

- A marca é **Sauim** (sauim.com.br). O contato oficial é **contato@sauim.com.br**.
- Todo texto do site é em português do Brasil, com tom humano, claro e profissional. Evite frases informais que pareçam amadoras.
- O plano grátis deixa baixar o áudio (MP3 e WAV), sem marca d'água e sem pegadinha. O que limita é só o volume de uso, e o contador deve aparecer na tela. Limite grátis escolhido: 10.000 caracteres por mês.
- Cada entrega de trabalho vai em um zip pronto para baixar.
