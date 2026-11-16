import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { billingEnabled, createPreapproval } from "@/lib/billing";

// Cria a assinatura no Mercado Pago e devolve o link de pagamento.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Entre na sua conta para assinar." }, { status: 401 });
  if (!billingEnabled()) return NextResponse.json({ error: "A assinatura ainda não está disponível." }, { status: 503 });

  const admin = createAdminClient();
  const { data: current } = await admin.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle();
  if (current?.status === "authorized") return NextResponse.json({ error: "Você já tem uma assinatura ativa." }, { status: 409 });

  try {
    const site = (process.env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");
    const pre = await createPreapproval({
      userId: user.id,
      email: user.email,
      backUrl: `${site}/conta?retorno=1`,
      amount: Number(process.env.PRO_PRICE_BRL),
      key: randomUUID(),
    });
    if (!pre.init_point) throw new Error("Resposta sem link de pagamento");
    const { error } = await admin.from("subscriptions").upsert(
      { user_id: user.id, mp_preapproval_id: pre.id, status: "pending", updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (error) throw error;
    return NextResponse.json({ url: pre.init_point });
  } catch (e) {
    console.error("checkout falhou:", e);
    return NextResponse.json({ error: "Não consegui abrir o pagamento agora. Tente de novo em instantes." }, { status: 502 });
  }
}
