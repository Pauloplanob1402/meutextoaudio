import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeOnce } from "@/lib/welcome";
import { PIX_DAYS, PIX_PREFIX, getPayment, getPreapproval, verifySignature } from "@/lib/billing";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// O Mercado Pago avisa aqui quando uma assinatura muda. Configure o endereço
// https://SEU-DOMINIO/api/mercadopago/webhook com o evento "subscription_preapproval".
export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? "";
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";

  if (dataId && !/^[A-Za-z0-9_-]{1,64}$/.test(dataId)) return new Response("id inválido", { status: 400 });
  if (!verifySignature(request.headers, dataId)) return new Response("assinatura inválida", { status: 401 });
  if (type === "payment" && dataId) return handlePix(dataId);
  if (type !== "subscription_preapproval" || !dataId) return new Response("ignorado", { status: 200 });

  try {
    // A notificação só diz "algo mudou". O estado verdadeiro vem direto da API do Mercado Pago.
    const pre = await getPreapproval(dataId);
    const userId = pre.external_reference ?? "";
    if (!UUID.test(userId)) return new Response("sem usuário", { status: 200 });

    const admin = createAdminClient();
    const { data: current } = await admin.from("subscriptions").select("mp_preapproval_id, status").eq("user_id", userId).maybeSingle();
    // Aviso atrasado de uma assinatura antiga não pode desligar a nova que está ativa.
    if (current && current.mp_preapproval_id !== pre.id && current.status === "authorized" && pre.status !== "authorized") {
      return new Response("assinatura antiga", { status: 200 });
    }
    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        mp_preapproval_id: pre.id,
        status: pre.status,
        next_payment_date: pre.next_payment_date ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
    if (pre.status === "authorized") await sendWelcomeOnce(admin, userId, { kind: "card", until: pre.next_payment_date ?? null });
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook falhou:", e);
    return new Response("erro", { status: 500 }); // o Mercado Pago tenta de novo
  }
}

// Pix de 30 dias: quando o pagamento é aprovado, libera (ou prorroga) o plano Criador.
async function handlePix(paymentId: string) {
  try {
    const pay = await getPayment(paymentId); // estado verdadeiro, direto do Mercado Pago
    const ref = pay.external_reference ?? "";
    if (!ref.startsWith("pix:") || pay.payment_method_id !== "pix" || pay.status !== "approved") return new Response("ignorado", { status: 200 });
    const userId = ref.slice(4);
    if (!UUID.test(userId)) return new Response("sem usuário", { status: 200 });
    if ((pay.transaction_amount ?? 0) + 0.001 < Number(process.env.PRO_PRICE_BRL)) return new Response("valor menor que o plano", { status: 200 });
    // Aviso repetido ou muito antigo não prorroga de novo.
    const approvedAt = pay.date_approved ? new Date(pay.date_approved).getTime() : Date.now();
    if (Date.now() - approvedAt > 2 * 86_400_000) return new Response("antigo", { status: 200 });

    const admin = createAdminClient();
    const marker = `${PIX_PREFIX}${pay.id}`;
    const { data: current } = await admin.from("subscriptions").select("mp_preapproval_id, status, next_payment_date").eq("user_id", userId).maybeSingle();
    if (current?.mp_preapproval_id === marker) return new Response("ok", { status: 200 }); // já aplicado
    if (current?.status === "authorized" && current.mp_preapproval_id && !current.mp_preapproval_id.startsWith(PIX_PREFIX)) {
      return new Response("já tem cartão ativo", { status: 200 });
    }
    // Se ainda há dias de Pix sobrando, os 30 dias novos entram depois deles.
    const left = current?.next_payment_date ? new Date(current.next_payment_date).getTime() : 0;
    const base = Math.max(Date.now(), current?.status === "authorized" ? left : 0);
    const ate = new Date(base + PIX_DAYS * 86_400_000).toISOString();
    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        mp_preapproval_id: marker,
        status: "authorized",
        next_payment_date: ate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
    await sendWelcomeOnce(admin, userId, { kind: "pix", until: ate });
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook pix falhou:", e);
    return new Response("erro", { status: 500 });
  }
}
