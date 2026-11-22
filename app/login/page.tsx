import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import LoginForm from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar · Sauim", robots: { index: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const { next: rawNext, erro } = await searchParams;
  const next = safeNext(rawNext);
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect(next);
  return (
    <Shell>
      <div className="auth tool">
        <h1>Entrar</h1>
        <p className="lead">Entre para acessar a sua conta e gerenciar o seu plano.</p>
        {erro && <p className="status" role="alert">Este link é inválido ou expirou. Solicite um novo abaixo.</p>}
        <LoginForm next={next} />
        <p className="note">Ao continuar, você concorda com os <Link href="/termos">Termos de Uso</Link> e com a <Link href="/privacidade">Política de Privacidade</Link>.</p>
      </div>
    </Shell>
  );
}
