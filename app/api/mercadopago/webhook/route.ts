import { createAdminClient } from "@/lib/supabase/admin";
import { getPreapproval, verifySignature } from "@/lib/billing";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// O Mercado Pago avisa aqui quando uma assinatura muda. Configure o endereço
// https://SEU-DOMINIO/api/mercadopago/webhook com o evento "subscription_preapproval".
export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? "";
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";

  if (!verifySignature(request.headers, dataId)) return new Response("assinatura inválida", { status: 401 });
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
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("webhook falhou:", e);
    return new Response("erro", { status: 500 }); // o Mercado Pago tenta de novo
  }
}
