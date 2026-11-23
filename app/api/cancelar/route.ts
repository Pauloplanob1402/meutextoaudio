import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { billingEnabled, cancelPreapproval } from "@/lib/billing";
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
    await cancelPreapproval(sub.mp_preapproval_id);
    await admin.from("subscriptions").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cancelamento falhou:", e);
    return NextResponse.json({ error: "Não foi possível cancelar agora. Tente de novo em instantes." }, { status: 502 });
  }
}
