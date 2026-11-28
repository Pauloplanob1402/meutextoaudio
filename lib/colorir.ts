// Páginas do livro de colorir (/colorir). A ordem daqui é a do site e a do PDF (scripts/colorir/gerar-pdf.py).
// Para acrescentar uma página: ponha o PNG e o WEBP em public/colorir/, inclua uma linha aqui e rode gerar-pdf.py.
// O número de páginas mostrado no site é calculado desta lista: nunca escreva à mão.
export const PAGES: { file: string; title: string }[] = [
  { file: "capa", title: "Meu Livro de Colorir" },
  { file: "descobrindo", title: "Descobrindo novos mundos" },
  { file: "aprender", title: "Aprender também é divertido!" },
  { file: "piquenique", title: "Piquenique com os amigos" },
  { file: "mao-na-massa", title: "Mão na massa!" },
  { file: "hora-de-descansar", title: "Hora de descansar" },
  { file: "compartilhando-ideias", title: "Compartilhando ideias" },
  { file: "celebrando-conquistas", title: "Celebrando suas conquistas" },
  { file: "no-ritmo-da-floresta", title: "No ritmo da floresta" },
  { file: "castelo-de-areia", title: "Castelo de areia" },
  { file: "jardim-das-borboletas", title: "Jardim das borboletas" },
  { file: "passeio-de-patinete", title: "Passeio de patinete" },
  { file: "pequeno-artista", title: "O pequeno artista" },
  { file: "montando-a-alegria", title: "Montando a alegria" },
  { file: "bolhas-de-sabao", title: "Bolhas de sabão" },
  { file: "caca-ao-tesouro", title: "Caça ao tesouro" },
  { file: "voce-e-especial", title: "Você é especial!" },
];

export const TOTAL_PAGINAS = PAGES.length;
