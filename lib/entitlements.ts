import { createClient } from "@/lib/supabase/server";

export type Account = { userId: string; email: string; status: string | null; nextPayment: string | null; plan: "free" | "pro" };

// Quem é o usuário e qual é o plano dele. Retorna null se não estiver logado.
// Para liberar um recurso só do Pro no servidor:  const a = await getAccount(); if (a?.plan !== "pro") return 403.
export async function getAccount(): Promise<Account | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  const { data: sub } = await supabase.from("subscriptions").select("status, next_payment_date").maybeSingle();
  const status = sub?.status ?? null;
  return {
    userId: claims.sub,
    email: (claims.email as string | undefined) ?? "",
    status,
    nextPayment: sub?.next_payment_date ?? null,
    plan: status === "authorized" ? "pro" : "free",
  };
}
