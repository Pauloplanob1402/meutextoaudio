"use client";
import Link from "next/link";
import { dismissAway, useToolHost } from "@/lib/toolHost";

// Barra que aparece em todas as páginas (menos na que mostra o Texto em áudio) enquanto o áudio é gerado ou quando termina.
export default function GeracaoBar() {
  const s = useToolHost();
  if (s.attached || (!s.busy && !s.away)) return null;
  return (
    <div className="sa-geracao" role="status" aria-live="polite">
      {s.busy ? (
        <>
          <span className="sa-geracao-dot" aria-hidden="true" />
          <span>{s.status || "Gerando o seu áudio…"}</span>
          <Link href="/#texto-audio">Ver</Link>
        </>
      ) : (
        <>
          <span>{s.status || "A geração do áudio terminou."}</span>
          <Link href="/#texto-audio">Abrir</Link>
          <button type="button" onClick={dismissAway}>Fechar</button>
        </>
      )}
    </div>
  );
}
