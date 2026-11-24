import "server-only";
import { LEGAL } from "@/lib/legal";

// Envio de e-mails do site (boas-vindas etc.) pela API do Brevo.
// Os e-mails de LOGIN (confirmar cadastro, redefinir senha) continuam sendo enviados pelo Supabase.
// Aqui só saem os e-mails que o próprio site decide mandar.
export type MailInput = { to: string; toName?: string; subject: string; html: string; text: string };

export async function sendEmail(m: MailInput): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    console.warn("BREVO_API_KEY ausente: e-mail não enviado.");
    return false;
  }
  const fromEmail = process.env.EMAIL_FROM || LEGAL.email;
  const fromName = process.env.EMAIL_FROM_NAME || "Sauim";
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        replyTo: { email: fromEmail, name: fromName },
        to: [{ email: m.to, name: m.toName }],
        subject: m.subject,
        htmlContent: m.html,
        textContent: m.text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("Brevo recusou o e-mail:", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("Falha ao chamar o Brevo:", e);
    return false;
  }
}
