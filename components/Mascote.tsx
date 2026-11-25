// O mascote do topo da página inicial e da página /historia.
// As duas imagens foram recortadas no mesmo molde (mesmo tamanho do sauim, mesma posição),
// e as duas páginas usam o mesmo CSS (.sa-mascote): por isso ficam sempre do mesmo tamanho e à mesma distância do topo.
const DADOS = {
  home: { w: 888, h: 719, alt: "Mascote do Sauim, um sauim de fone de ouvido, sorrindo" },
  historia: { w: 888, h: 750, alt: "O mascote da SAUIM, um sauim de fones azuis, segura uma placa com SAIUM riscado e SAUIM escrito do jeito certo." },
} as const;

export default function Mascote({ variante }: { variante: "home" | "historia" }) {
  const d = DADOS[variante];
  return (
    <picture className={`sa-mascote sa-mascote-${variante}`}>
      <source type="image/webp" srcSet={`/marca/mascote-${variante}-480.webp 480w, /marca/mascote-${variante}.webp 888w`} sizes="(max-width: 700px) 100vw, 645px" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/marca/mascote-${variante}.jpg`} width={d.w} height={d.h} alt={d.alt} fetchPriority="high" decoding="async" />
    </picture>
  );
}
