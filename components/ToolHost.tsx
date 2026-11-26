"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getHostElement, useToolHost } from "@/lib/toolHost";

// Só carrega o Texto em áudio quando a página inicial pede, e depois não o desmonta mais: é isso que mantém a geração viva.
const Tool = dynamic(() => import("@/components/Tool"), { ssr: false });

export default function ToolHost() {
  const { requested, busy } = useToolHost();
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (requested) setEl(getHostElement());
  }, [requested]);

  // Fechar ou recarregar a aba durante a geração perderia o áudio: o navegador pergunta antes.
  useEffect(() => {
    if (!busy) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [busy]);

  return el ? createPortal(<Tool />, el) : null;
}
