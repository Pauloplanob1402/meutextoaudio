import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { billingEnabled, createPreapproval, parsePeriod, priceFor } from "@/lib/billing";
import { forbidden, sameOrigin } from "@/lib/origin";

// Cria a assinatura no Mercado Pago e devolve o link de pagamento.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Entre na sua conta para assinar." }, { status: 401 });
  if (!billingEnabled()) return NextResponse.json({ error: "A assinatura ainda não está disponível." }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as { period?: string };
  const period = parsePeriod(body.period);

  const admin = createAdminClient();
  const { data: current } = await admin.from("subscriptions").select("status, updated_at").eq("user_id", user.id).maybeSingle();
  if (current?.status === "authorized") return NextResponse.json({ error: "Você já tem uma assinatura ativa." }, { status: 409 });
  // Evita criar várias assinaturas seguidas (duplo clique ou abuso): espera alguns segundos entre tentativas.
  if (current?.status === "pending" && current.updated_at && Date.now() - new Date(current.updated_at).getTime() < 15_000) {
    return NextResponse.json({ error: "Aguarde alguns segundos e tente de novo." }, { status: 429, headers: { "Retry-After": "15" } });
  }

  try {
    const site = (process.env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");
    const pre = await createPreapproval({
      userId: user.id,
      email: user.email,
      backUrl: `${site}/conta?retorno=1`,
      amount: priceFor(period),
      key: randomUUID(),
      period,
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
    return NextResponse.json({ error: "Não foi possível abrir o pagamento agora. Tente de novo em instantes." }, { status: 502 });
  }
}
