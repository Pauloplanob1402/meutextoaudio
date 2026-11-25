import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { billingEnabled, cancelPreapproval, getPreapproval, isAnnualPreapproval } from "@/lib/billing";
import { forbidden, sameOrigin } from "@/lib/origin";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta." }, { status: 401 });
  if (!billingEnabled()) return NextResponse.json({ error: "Cobrança indisponível." }, { status: 503 });

  const admin = createAdminClient();
  const { data: sub } = await admin.from("subscriptions").select("mp_preapproval_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.mp_preapproval_id) return NextResponse.json({ error: "Você não tem assinatura." }, { status: 404 });
  if (sub.mp_preapproval_id.startsWith("pix_")) return NextResponse.json({ error: "O Pix não renova sozinho. Ele termina na data indicada." }, { status: 400 });
  try {
    // No plano anual, quem cancela a renovação mantém o acesso até o fim do ano já pago.
    let keep: { period: "annual"; access_until: string } | null = null;
    try {
      const pre = await getPreapproval(sub.mp_preapproval_id);
      if (pre.status === "authorized" && isAnnualPreapproval(pre) && pre.next_payment_date && new Date(pre.next_payment_date).getTime() > Date.now()) {
        keep = { period: "annual", access_until: pre.next_payment_date };
      }
    } catch { /* sem a consulta, cancela como antes */ }
    await cancelPreapproval(sub.mp_preapproval_id);
    await admin.from("subscriptions").update({ status: "cancelled", ...(keep ?? {}), updated_at: new Date().toISOString() }).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cancelamento falhou:", e);
    return NextResponse.json({ error: "Não foi possível cancelar agora. Tente de novo em instantes." }, { status: 502 });
  }
}
