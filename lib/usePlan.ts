"use client";
import { useEffect, useState } from "react";

// Pergunta o plano uma vez por visita e reaproveita a resposta em todos os botões da página.
let pending: Promise<"free" | "pro"> | null = null;
function fetchPlan() {
  pending ??= fetch("/api/plano", { cache: "no-store" })
    .then((r) => r.json())
    .then((j) => (j.plan === "pro" ? "pro" : "free") as "free" | "pro")
    .catch(() => "free" as const);
  return pending;
}

// "loading" e "free" mostram o texto padrão; "pro" mostra o aviso de plano ativo.
export function usePlan(): "loading" | "free" | "pro" {
  const [plan, setPlan] = useState<"loading" | "free" | "pro">("loading");
  useEffect(() => { fetchPlan().then(setPlan); }, []);
  return plan;
}
