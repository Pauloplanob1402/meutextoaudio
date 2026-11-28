#!/usr/bin/env python3
"""Refaz o PDF do livro de colorir (public/colorir/livro-de-colorir-sauim.pdf) com as páginas de lib/colorir.ts, na ordem de lá.
Uso (na pasta do projeto):   python3 scripts/colorir/gerar-pdf.py        Precisa de: pip install img2pdf
Cada página é o PNG A4 sem perda (nada de JPEG), então o PDF imprime nítido."""
import os, re, img2pdf

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
nomes = re.findall(r'file:\s*"([^"]+)"', open(os.path.join(RAIZ, "lib", "colorir.ts"), encoding="utf-8").read())
pngs = [os.path.join(RAIZ, "public", "colorir", n + ".png") for n in nomes]
faltam = [p for p in pngs if not os.path.exists(p)]
if faltam:
    raise SystemExit("Faltam arquivos: " + ", ".join(faltam))
a4 = (img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297))
saida = os.path.join(RAIZ, "public", "colorir", "livro-de-colorir-sauim.pdf")
with open(saida, "wb") as f:
    f.write(img2pdf.convert(pngs, layout_fun=img2pdf.get_layout_fun(a4), title="Livro de colorir do Sauim", author="Sauim (www.sauim.com.br)"))
print(f"PDF com {len(pngs)} páginas: {saida} ({os.path.getsize(saida)/1e6:.1f} MB)")
