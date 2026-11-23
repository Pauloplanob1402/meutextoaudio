import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PIX_PREFIX, billingEnabled, createPixPayment } from "@/lib/billing";
import { forbidden, sameOrigin } from "@/lib/origin";

// Gera um Pix de 30 dias. O plano só é liberado depois que o Mercado Pago confirma o pagamento (webhook).
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Entre na sua conta para assinar." }, { status: 401 });
  if (!billingEnabled()) return NextResponse.json({ error: "A assinatura ainda não está disponível." }, { status: 503 });

  const admin = createAdminClient();
  const { data: current } = await admin.from("subscriptions").select("mp_preapproval_id, status").eq("user_id", user.id).maybeSingle();
  // Quem tem cartão ativo não precisa de Pix. Quem já paga por Pix pode renovar.
  if (current?.status === "authorized" && !current.mp_preapproval_id?.startsWith(PIX_PREFIX)) {
    return NextResponse.json({ error: "Você já tem uma assinatura ativa." }, { status: 409 });
  }

  try {
    const site = (process.env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");
    const pay = await createPixPayment({
      userId: user.id,
      email: user.email,
      amount: Number(process.env.PRO_PRICE_BRL),
      notificationUrl: `${site}/api/mercadopago/webhook`,
      key: randomUUID(),
    });
    const t = pay.point_of_interaction?.transaction_data;
    if (!t?.qr_code || !t.qr_code_base64) throw new Error("Resposta sem o código Pix");
    return NextResponse.json({ code: t.qr_code, qr: t.qr_code_base64 });
  } catch (e) {
    console.error("pix falhou:", e);
    return NextResponse.json({ error: "Não foi possível gerar o Pix agora. Tente de novo em instantes." }, { status: 502 });
  }
}
