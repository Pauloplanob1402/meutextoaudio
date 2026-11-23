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

// ---------- Pix de 30 dias (pago uma vez por mês, sem renovação automática) ----------

export const PIX_DAYS = 30;
export const PIX_PREFIX = "pix_"; // marca na assinatura: "pix_" + número do pagamento

export type MpPayment = {
  id: number;
  status: string;
  payment_method_id?: string;
  transaction_amount?: number;
  external_reference?: string;
  date_approved?: string | null;
  point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } };
};

async function mpPayment(path: string, init: RequestInit & { idempotency?: string } = {}): Promise<MpPayment> {
  const { idempotency, ...rest } = init;
  const res = await fetch(API + path, {
    ...rest,
    headers: { ...auth(), ...(idempotency ? { "X-Idempotency-Key": idempotency } : {}) },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body as MpPayment;
}

// Cria um Pix de 30 dias. O pagamento vale por 30 minutos para ser feito.
export function createPixPayment(p: { userId: string; email: string; amount: number; notificationUrl: string; key: string }) {
  const expires = new Date(Date.now() + 30 * 60_000 - 3 * 3_600_000).toISOString().replace("Z", "-03:00");
  return mpPayment("/v1/payments", {
    method: "POST",
    idempotency: p.key,
    body: JSON.stringify({
      transaction_amount: p.amount,
      description: "Sauim Criador (30 dias)",
      payment_method_id: "pix",
      payer: { email: p.email },
      external_reference: `pix:${p.userId}`,
      notification_url: p.notificationUrl,
      date_of_expiration: expires,
    }),
  });
}

export const getPayment = (id: string) => mpPayment(`/v1/payments/${encodeURIComponent(id)}`);
