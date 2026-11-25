import { createClient } from "@/lib/supabase/server";

export type Account = {
  userId: string; email: string; status: string | null; nextPayment: string | null; plan: "free" | "pro"; pix: boolean;
  period: "monthly" | "annual"; accessUntil: string | null;
};

// Quem é o usuário e qual é o plano dele. Retorna null se não estiver logado.
// Para liberar um recurso só do Pro no servidor:  const a = await getAccount(); if (a?.plan !== "pro") return 403.
export async function getAccount(): Promise<Account | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  const { data: sub } = await supabase.from("subscriptions").select("status, next_payment_date, mp_preapproval_id").maybeSingle();
  const status = sub?.status ?? null;
  const pix = Boolean(sub?.mp_preapproval_id?.startsWith("pix_"));
  // Pix vale só até a data guardada; o cartão segue o status que o Mercado Pago informa.
  const pixVencido = pix && (!sub?.next_payment_date || new Date(sub.next_payment_date).getTime() < Date.now());
  // Colunas do plano anual, lidas à parte: se o SQL novo ainda não rodou, quem já assina não perde o acesso.
  const { data: ext } = await supabase.from("subscriptions").select("period, access_until").maybeSingle();
  const period = ext?.period === "annual" ? "annual" : "monthly";
  const accessUntil: string | null = ext?.access_until ?? null;
  // Anual cancelado: a renovação parou, mas o ano pago segue valendo até a data guardada.
  const anualPago = period === "annual" && status === "cancelled" && Boolean(accessUntil) && new Date(accessUntil as string).getTime() > Date.now();
  return {
    userId: claims.sub,
    email: (claims.email as string | undefined) ?? "",
    status,
    nextPayment: sub?.next_payment_date ?? null,
    plan: (status === "authorized" && !pixVencido) || anualPago ? "pro" : "free",
    pix,
    period,
    accessUntil,
  };
}
