"use client";
import { useState } from "react";

const MSG = "Meu filho pintou com o Sauim! Baixe o livro de colorir grátis em www.sauim.com.br/colorir #ColoreComOSauim";

// Depois de baixar: um pedido simples e fácil de cumprir (copiar a frase ou usar o compartilhar do aparelho).
export default function ShareColor() {
  const [done, setDone] = useState(false);
  async function share() {
    try {
      if (navigator.share) { await navigator.share({ text: MSG }); return; }
    } catch { /* cancelou: tenta copiar */ }
    try { await navigator.clipboard.writeText(MSG); setDone(true); setTimeout(() => setDone(false), 4000); } catch { setDone(false); }
  }
  return (
    <div>
      <p className="note" style={{ marginTop: 0 }}>Frase pronta: “{MSG}”</p>
      <button className="btn go" type="button" onClick={share}>{done ? "Frase copiada! Cole na sua rede." : "Compartilhar ou copiar a frase"}</button>
    </div>
  );
}
