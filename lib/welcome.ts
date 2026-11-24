import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { buildWelcomeEmail, firstName } from "@/lib/welcomeEmail";

type Admin = ReturnType<typeof createAdminClient>;

// Manda o e-mail de boas-vindas UMA vez por pessoa, na primeira vez que o plano Criador é liberado.
// Nunca derruba o webhook: se der erro, só registra no log (o pagamento já foi gravado).
export async function sendWelcomeOnce(admin: Admin, userId: string, o: { kind: "card" | "pix"; until: string | null }) {
  const soltar = () => admin.from("subscriptions").update({ welcome_sent_at: null }).eq("user_id", userId);
  try {
    // "Reserva" o envio antes de mandar, para dois avisos seguidos do Mercado Pago não gerarem dois e-mails.
    const { data: reservou, error } = await admin
      .from("subscriptions")
      .update({ welcome_sent_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("welcome_sent_at", null)
      .select("user_id");
    if (error) {
      console.error("boas-vindas: não consegui reservar o envio (rodou o SQL novo?):", error.message);
      return;
    }
    if (!reservou?.length) return; // já foi enviado antes

    const { data: u } = await admin.auth.admin.getUserById(userId);
    const user = u?.user;
    const email = user?.email;
    if (!user || !email) {
      await soltar();
      return;
    }
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const nome = firstName(String(meta.full_name ?? meta.name ?? ""));
    const msg = buildWelcomeEmail({ name: nome, kind: o.kind, until: o.until, site: process.env.SITE_URL });
    const ok = await sendEmail({ to: email, toName: nome ?? undefined, subject: msg.subject, html: msg.html, text: msg.text });
    if (!ok) await soltar(); // libera para tentar de novo no próximo aviso de pagamento
  } catch (e) {
    console.error("boas-vindas falhou:", e);
    try {
      await soltar();
    } catch {}
  }
}
