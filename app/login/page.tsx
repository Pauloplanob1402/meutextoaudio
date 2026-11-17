import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import LoginForm from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar · texto-áudio", robots: { index: false } };

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
        <p className="lead">A conta só é necessária para assinar o plano Pro. O texto para áudio continua grátis e sem cadastro.</p>
        {erro && <p className="status" role="alert">Esse link não funcionou ou já expirou. Peça um novo abaixo.</p>}
        <LoginForm next={next} />
        <p className="note">Ao continuar, você concorda com os <Link href="/termos">Termos de Uso</Link> e com a <Link href="/privacidade">Política de Privacidade</Link>.</p>
      </div>
    </Shell>
  );
}
