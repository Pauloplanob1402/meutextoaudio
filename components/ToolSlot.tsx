"use client";
import { useEffect, useRef } from "react";
import { getHostElement, requestHost, setAttached, useToolHost } from "@/lib/toolHost";

// Fica no lugar do Texto em áudio, na página inicial: pede o componente e encaixa nele.
export default function ToolSlot() {
  const ref = useRef<HTMLDivElement>(null);
  const { loaded } = useToolHost();

  useEffect(() => {
    const slot = ref.current;
    if (!slot) return;
    const host = getHostElement();
    slot.appendChild(host);
    setAttached(true);
    requestHost();
    return () => {
      if (host.parentNode === slot) slot.removeChild(host);
      setAttached(false);
    };
  }, []);

  return (
    <div ref={ref}>
      {!loaded && <p className="note" style={{ minHeight: 480 }}>Carregando o Texto em áudio…</p>}
      <noscript>O Texto em áudio precisa do JavaScript ativado no navegador.</noscript>
    </div>
  );
}
