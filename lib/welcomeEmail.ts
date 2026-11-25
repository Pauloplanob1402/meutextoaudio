// Monta o e-mail de boas-vindas de quem assinou o plano Criador. Não envia nada: só devolve assunto, HTML e texto.
import { getTool } from "@/lib/tools";
import { VOICES, voiceNames } from "@/lib/voices";
import { LEGAL } from "@/lib/legal";

export type WelcomeInput = {
  name?: string | null; // primeiro nome, se houver (login com Google costuma ter)
  kind: "card" | "pix"; // cartão renova sozinho; Pix vale por 30 dias
  period?: "monthly" | "annual"; // padrão: mensal
  until?: string | null; // próxima cobrança (cartão) ou fim do período pago (Pix)
  site?: string; // endereço do site, sem barra no fim
};

// Por onde começar, na ordem em que um vídeo nasce. Se uma ferramenta sair do catálogo, ela some do e-mail sozinha.
const PASSOS: { slug: string; titulo: string }[] = [
  { slug: "gerador-de-titulos", titulo: "Comece pelo título" },
  { slug: "validador-de-gancho", titulo: "Teste os primeiros segundos" },
  { slug: "roteiro-em-blocos", titulo: "Monte o roteiro" },
  { slug: "simulador-de-ctr", titulo: "Veja como vai aparecer" },
  { slug: "checklist-de-publicacao", titulo: "Confira antes de publicar" },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const data = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" }) : null;

export function firstName(raw?: string | null): string | null {
  const n = (raw ?? "").trim().split(/\s+/)[0] ?? "";
  return n && n.length <= 30 ? n : null;
}

export function buildWelcomeEmail(i: WelcomeInput) {
  const site = (i.site ?? "https://sauim.com.br").replace(/\/$/, "");
  const nome = firstName(i.name);
  const ola = nome ? `Oi, ${nome}!` : "Olá!";
  const fim = data(i.until);
  const vozes = VOICES.filter((v) => v.plan === "pro");
  const naturais = vozes.filter((v) => v.engine === "kokoro").map((v) => v.name);

  const passos: { titulo: string; texto: string; url: string; botao: string }[] = [];
  for (const p of PASSOS) {
    const t = getTool(p.slug);
    if (t) passos.push({ titulo: p.titulo, texto: t.short, url: `${site}/ferramentas/${t.slug}`, botao: t.title });
  }
  // A narração entra depois do roteiro (posição 3).
  passos.splice(3, 0, {
    titulo: "Dê voz ao roteiro",
    texto: `Gere a narração com ${voiceNames("pro")}.${naturais.length ? ` ${naturais.join(", ").replace(/, ([^,]*)$/, " e $1")} são vozes mais naturais, com geração um pouco mais lenta.` : ""}`,
    url: `${site}/#texto-audio`,
    botao: "Texto em áudio",
  });

  const anual = i.period === "annual";
  const assinatura =
    i.kind === "pix"
      ? `Você pagou por Pix. O plano Criador fica ativo${fim ? ` até ${fim}` : anual ? " por 1 ano" : " por 30 dias"} e não renova sozinho: para continuar, é só pagar de novo.`
      : anual
        ? `A cobrança é anual e automática${fim ? `, e a próxima será em ${fim}` : ""}. Se cancelar a renovação, você segue com o plano até o fim do período pago, na página Minha conta.`
        : `A cobrança é mensal e automática${fim ? `, e a próxima será em ${fim}` : ""}. Você pode cancelar quando quiser, na página Minha conta.`;

  const subject = nome ? `${nome}, o seu plano Criador está ativo` : "O seu plano Criador está ativo";
  const pre = "Suas vozes e ferramentas já estão liberadas. Veja por onde começar.";

  const botao = (url: string, txt: string, solido = true) =>
    `<a href="${url}" style="display:inline-block;${solido ? "background:#3D3DF0;color:#ffffff;" : "background:#E4E4FF;color:#3D3DF0;"}text-decoration:none;font:600 14px Arial,Helvetica,sans-serif;padding:10px 20px;border-radius:999px;">${esc(txt)}</a>`;

  const linhasPassos = passos
    .map(
      (p, n) => `
      <tr><td style="padding:14px 0;border-top:1px solid #D9D9E8;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="36" valign="top" style="font:700 20px Arial,Helvetica,sans-serif;color:#3D3DF0;">${n + 1}</td>
          <td valign="top">
            <div style="font:700 16px Arial,Helvetica,sans-serif;color:#12122B;">${esc(p.titulo)}</div>
            <div style="font:400 14px/1.5 Arial,Helvetica,sans-serif;color:#5A5A78;margin:4px 0 10px;">${esc(p.texto)}</div>
            ${botao(p.url, `Abrir ${p.botao}`, false)}
          </td>
        </tr></table>
      </td></tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F6F6F9;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(pre)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F6F9;"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;">
    <tr><td style="padding:28px 32px 8px;font:700 22px Arial,Helvetica,sans-serif;color:#3D3DF0;">Sauim</td></tr>
    <tr><td style="padding:8px 32px 0;">
      <h1 style="margin:0 0 12px;font:700 26px/1.25 Arial,Helvetica,sans-serif;color:#12122B;">${esc(ola)} O seu plano Criador está ativo.</h1>
      <p style="margin:0 0 14px;font:400 15px/1.6 Arial,Helvetica,sans-serif;color:#12122B;">Obrigado por apostar no seu canal e em nós. A gente sabe como é publicar o primeiro vídeo com um frio na barriga, porque também já esteve aí. O Sauim existe para você errar menos do que a gente errou no primeiro dia.</p>
      <p style="margin:0 0 22px;font:400 15px/1.6 Arial,Helvetica,sans-serif;color:#12122B;">Agora estão liberadas ${vozes.length} vozes (${esc(voiceNames("pro"))}) e todas as ferramentas do site. Para não se perder, aqui vai um caminho curto, na ordem em que um vídeo nasce:</p>
    </td></tr>
    <tr><td style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${linhasPassos}</table></td></tr>
    <tr><td style="padding:20px 32px 0;">
      <div style="background:#E4E4FF;border-radius:12px;padding:16px 18px;font:400 14px/1.55 Arial,Helvetica,sans-serif;color:#12122B;">
        <b>Sobre a sua assinatura.</b> ${esc(assinatura)}
        <div style="margin-top:10px;">${botao(`${site}/conta`, "Ir para Minha conta")}</div>
      </div>
    </td></tr>
    <tr><td style="padding:22px 32px 8px;">
      <p style="margin:0 0 8px;font:400 15px/1.6 Arial,Helvetica,sans-serif;color:#12122B;">Ficou com alguma dúvida? Responda este e-mail que a gente lê e responde. E se quiser saber como o Sauim nasceu, <a href="${site}/historia" style="color:#3D3DF0;">a história está aqui</a>.</p>
      <p style="margin:0;font:400 15px/1.6 Arial,Helvetica,sans-serif;color:#12122B;">Comece pequeno. Cresça gigante.<br>Equipe Sauim</p>
    </td></tr>
    <tr><td style="padding:22px 32px 28px;font:400 12px/1.5 Arial,Helvetica,sans-serif;color:#5A5A78;border-top:1px solid #D9D9E8;">
      Você recebeu este e-mail porque assinou o plano Criador no Sauim. Dúvidas ou pedidos sobre os seus dados: ${esc(LEGAL.email)}.<br>
      <a href="${site}/privacidade" style="color:#5A5A78;">Privacidade</a> · <a href="${site}/termos" style="color:#5A5A78;">Termos</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = [
    `${ola} O seu plano Criador está ativo.`,
    "",
    "Obrigado por apostar no seu canal e em nós. O Sauim existe para você errar menos do que a gente errou no primeiro dia.",
    "",
    `Estão liberadas ${vozes.length} vozes (${voiceNames("pro")}) e todas as ferramentas do site. Por onde começar:`,
    "",
    ...passos.map((p, n) => `${n + 1}. ${p.titulo}\n   ${p.texto}\n   ${p.url}`),
    "",
    `Sobre a sua assinatura: ${assinatura}`,
    `Minha conta: ${site}/conta`,
    "",
    `Dúvidas? Responda este e-mail. A nossa história: ${site}/historia`,
    "",
    "Comece pequeno. Cresça gigante.",
    "Equipe Sauim",
    "",
    `Privacidade: ${site}/privacidade · Termos: ${site}/termos`,
  ].join("\n");

  return { subject, html, text };
}
