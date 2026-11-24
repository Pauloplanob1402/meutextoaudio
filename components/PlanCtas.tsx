"use client";
import Link from "next/link";
import { usePlan } from "@/lib/usePlan";

// Botão do topo: "Começar grátis" para quem não assina; "Plano Criador ativo" para quem assina.
export function HeaderCta({ href }: { href: string }) {
  const plan = usePlan();
  if (plan === "pro") return <Link className="sa-cta" href="/conta">Plano Criador ativo ✓</Link>;
  return <a className="sa-cta" href={href}>Começar grátis</a>;
}

// Botão do cartão Grátis, na seção de planos.
export function FreeCardCta() {
  const plan = usePlan();
  if (plan === "pro") return <a className="btn ghost" href="#texto-audio">Usar o Texto em áudio</a>;
  return <a className="btn ghost" href="#texto-audio">Começar grátis</a>;
}

// Botão do cartão Criador: quem já assina vê que o plano está ativo.
export function ProCardCta() {
  const plan = usePlan();
  if (plan === "pro") return <Link className="btn" href="/conta">Você está no plano Criador ✓</Link>;
  return <Link className="btn" href="/conta">Assinar o plano Criador</Link>;
}
