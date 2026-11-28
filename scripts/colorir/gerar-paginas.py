#!/usr/bin/env python3
"""Gera as páginas do livro de colorir do Sauim (A4, 2480 x 3508, preto e branco) a partir dos desenhos feitos no Gemini.

Uso (na pasta do projeto):   python3 scripts/colorir/gerar-paginas.py
Precisa de: pip install pillow numpy

O que faz com cada desenho de scripts/colorir/originais/ (segue o PADROES.md, seção 4):
  1. tira o cinza e a cor que sobrarem (tudo vira preto ou branco; as bordas ficam suaves),
  2. recorta o espaço em branco e amplia para caber no A4,
  3. se o desenho encosta na borda da imagem (cenas cortadas, como árvores e canteiros), coloca uma moldura arredondada,
  4. coloca por código: título no topo, frase afetiva embaixo da arte e www.sauim.com.br no rodapé,
  5. grava o PNG A4 (para imprimir) e o WEBP 560 x 792 (miniatura) em public/colorir/.
Para refazer uma página: troque o desenho em originais/ ou o texto em PAGINAS e rode de novo.
"""
import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, "..", ".."))
ORIG = os.path.join(AQUI, "originais")
FONTES = os.path.join(AQUI, "fontes")
SAIDA = os.path.join(RAIZ, "public", "colorir")

W, H = 2480, 3508
TITULO_TOPO = 190          # topo do título (como nas páginas atuais)
ARTE_X0, ARTE_X1 = 160, 2320
ARTE_Y0, ARTE_Y1 = 520, 2780
FRASE_TOPO = 2866          # topo da frase (como nas páginas atuais)
RODAPE_TOPO = 3302         # topo do endereço (como nas páginas atuais)
LARGURA_TEXTO = 2100

F_TITULO = os.path.join(FONTES, "mali-latin-700-normal.woff")
F_FRASE = os.path.join(FONTES, "poppins-latin-600-normal.woff")
F_RODAPE = os.path.join(FONTES, "Poppins-Bold.ttf")

# arquivo original, nome do arquivo final, título, frase afetiva
PAGINAS = [
    ("01-castelo-de-areia.jpeg", "castelo-de-areia", "Castelo de areia", "Fiz para a mamãe, com todo o amor!"),
    ("02-jardim-das-borboletas.jpeg", "jardim-das-borboletas", "Jardim das borboletas", "Pintei para você, com muito carinho!"),
    ("03-passeio-de-patinete.jpeg", "passeio-de-patinete", "Passeio de patinete", "Que a alegria de hoje dure muito!"),
    ("04-pequeno-artista.jpeg", "pequeno-artista", "O pequeno artista", "Desenhe o quadro que o Sauim pinta!"),
    ("05-montando-a-alegria.jpeg", "montando-a-alegria", "Montando a alegria", "Pintei para a vovó, peça por peça!"),
    ("06-bolhas-de-sabao.jpeg", "bolhas-de-sabao", "Bolhas de sabão", "Que o seu dia seja leve e feliz!"),
    ("07-caca-ao-tesouro.jpeg", "caca-ao-tesouro", "Caça ao tesouro", "Pintei para o papai, meu tesouro!"),
]


def fonte_que_cabe(caminho, texto, maximo, largura, stroke=0):
    d = ImageDraw.Draw(Image.new("L", (10, 10)))
    for tam in range(maximo, 40, -2):
        f = ImageFont.truetype(caminho, tam)
        bb = d.textbbox((0, 0), texto, font=f, stroke_width=stroke)
        if bb[2] - bb[0] <= largura:
            return f
    return ImageFont.truetype(caminho, 40)


def texto_centrado(img, texto, fonte, topo, stroke=0):
    """Escreve o texto centrado, com o TOPO da tinta em `topo`. Devolve a base da tinta."""
    d = ImageDraw.Draw(img)
    bb = d.textbbox((0, 0), texto, font=fonte, stroke_width=stroke)
    x = (W - (bb[2] - bb[0])) // 2 - bb[0]
    y = topo - bb[1]
    d.text((x, y), texto, font=fonte, fill=0, stroke_width=stroke, stroke_fill=0)
    return topo + (bb[3] - bb[1])


def preparar_arte(caminho):
    """Abre o desenho, limpa para preto e branco e recorta. Devolve (imagem L, encosta_na_borda)."""
    im = Image.open(caminho).convert("L")
    a = np.array(im)
    ys, xs = np.where(a < 170)
    encosta = xs.min() <= 6 or xs.max() >= im.width - 7
    pad = 24
    if encosta:  # cena cortada pela borda: mantém a largura inteira e põe moldura
        box = (0, max(ys.min() - pad, 0), im.width, min(ys.max() + pad, im.height))
    else:
        box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, im.width), min(ys.max() + pad, im.height))
    return im.crop(box), encosta


def limpar(im):
    """Cinza e cor viram preto ou branco, com borda suave (anti-serrilhado)."""
    a = np.asarray(im, dtype=np.float32)
    a = np.clip((a - 100.0) / (205.0 - 100.0), 0.0, 1.0) * 255.0
    return Image.fromarray(a.astype(np.uint8), "L")


def montar(arquivo, nome, titulo, frase):
    arte, encosta = preparar_arte(os.path.join(ORIG, arquivo))
    caixa_w, caixa_h = ARTE_X1 - ARTE_X0, ARTE_Y1 - ARTE_Y0
    esc = min(caixa_w / arte.width, caixa_h / arte.height)
    novo = (round(arte.width * esc), round(arte.height * esc))
    arte = limpar(arte.resize(novo, Image.LANCZOS))
    if encosta:  # moldura arredondada junto da borda: fecha as linhas cortadas
        d = ImageDraw.Draw(arte)
        esp = 14
        d.rounded_rectangle((esp // 2, esp // 2, arte.width - 1 - esp // 2, arte.height - 1 - esp // 2), radius=70, outline=0, width=esp)
    pagina = Image.new("L", (W, H), 255)
    pagina.paste(arte, (ARTE_X0 + (caixa_w - arte.width) // 2, ARTE_Y0 + (caixa_h - arte.height) // 2))

    texto_centrado(pagina, titulo, fonte_que_cabe(F_TITULO, titulo, 187, LARGURA_TEXTO, 2), TITULO_TOPO, 2)
    texto_centrado(pagina, frase, fonte_que_cabe(F_FRASE, frase, 110, LARGURA_TEXTO), FRASE_TOPO)
    texto_centrado(pagina, "www.sauim.com.br", ImageFont.truetype(F_RODAPE, 96), RODAPE_TOPO)

    os.makedirs(SAIDA, exist_ok=True)
    pagina.save(os.path.join(SAIDA, nome + ".png"), optimize=True, dpi=(300, 300))
    pagina.convert("RGB").resize((560, 792), Image.LANCZOS).save(os.path.join(SAIDA, nome + ".webp"), quality=82)
    print("ok", nome, "moldura" if encosta else "", f"arte {arte.width}x{arte.height}")


if __name__ == "__main__":
    for p in PAGINAS:
        montar(*p)
