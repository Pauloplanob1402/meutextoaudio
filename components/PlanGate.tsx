"use client";
import { useEffect, useState, type ReactNode } from "react";

// Mostra a ferramenta só para quem tem o plano Criador. Quem não tem vê um aviso com o caminho para assinar.
// A trava é feita na tela (as ferramentas rodam no navegador), como nas vozes do Texto em áudio.
export default function PlanGate({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<"loading" | "free" | "pro">("loading");

  useEffect(() => {
    fetch("/api/plano", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setPlan(j.plan === "pro" ? "pro" : "free"))
      .catch(() => setPlan("free"));
  }, []);

  if (plan === "pro") return <>{children}</>;
  if (plan === "loading") return <p className="note">Carregando…</p>;
  return (
    <div className="tool" style={{ textAlign: "center" }}>
      <h2 style={{ fontSize: 24 }}>Esta ferramenta faz parte do plano Criador.</h2>
      <p className="note" style={{ marginTop: 8 }}>O plano Criador libera todas as ferramentas e todas as vozes do Texto em áudio.</p>
      <p style={{ marginTop: 20 }}><a className="btn go" href="/conta">Ver o plano Criador</a></p>
    </div>
  );
}
