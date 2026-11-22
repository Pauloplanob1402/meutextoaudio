import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.mercadopago.com";

export const billingEnabled = () =>
  Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET && Number(process.env.PRO_PRICE_BRL) > 0);

const auth = () => ({ Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" });

export type Preapproval = {
  id: string;
  status: string; // pending | authorized | paused | cancelled
  external_reference?: string;
  next_payment_date?: string;
  init_point?: string;
};

async function mp(path: string, init: RequestInit & { idempotency?: string } = {}): Promise<Preapproval> {
  const { idempotency, ...rest } = init;
  const res = await fetch(API + path, {
    ...rest,
    headers: { ...auth(), ...(idempotency ? { "X-Idempotency-Key": idempotency } : {}) },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body as Preapproval;
}

// Cria a assinatura mensal (sem plano) e devolve o link do checkout (init_point).
export function createPreapproval(p: { userId: string; email: string; backUrl: string; amount: number; key: string }) {
  return mp("/preapproval", {
    method: "POST",
    idempotency: p.key,
    body: JSON.stringify({
      reason: "Sauim Criador (mensal)",
      external_reference: p.userId,
      payer_email: p.email,
      back_url: p.backUrl,
      status: "pending",
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: p.amount, currency_id: "BRL" },
    }),
  });
}

export const getPreapproval = (id: string) => mp(`/preapproval/${encodeURIComponent(id)}`);

export const cancelPreapproval = (id: string) =>
  mp(`/preapproval/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });

// Confere a assinatura (x-signature) das notificações, como na documentação do Mercado Pago:
// manifesto "id:[data.id];request-id:[x-request-id];ts:[ts];" assinado com HMAC SHA256.
// Não checamos a idade do "ts": o webhook sempre consulta o estado real na API do Mercado Pago,
// então repetir uma notificação antiga não muda nada.
export function verifySignature(headers: Headers, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const sig = headers.get("x-signature");
  const reqId = headers.get("x-request-id");
  if (!secret || !sig || !reqId) return false;
  let ts = "";
  let v1 = "";
  for (const part of sig.split(",")) {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (k === "ts") ts = v;
    if (k === "v1") v1 = v;
  }
  if (!ts || !v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${reqId};ts:${ts};`;
  const expected = Buffer.from(createHmac("sha256", secret).update(manifest).digest("hex"));
  const given = Buffer.from(v1);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
