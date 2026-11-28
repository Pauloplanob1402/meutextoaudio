"use client";
import { useRef, useState } from "react";
import { helpContent, helpGmail, helpMailto, helpOutlook, helpPlainText } from "@/lib/talentos";

// Botões para mandar o e-mail de "quero ajudar". Um link mailto: sozinho não faz nada em quem não tem programa de e-mail
// configurado (comum no Windows com Gmail pelo navegador), então há sempre quatro caminhos: programa de e-mail, Gmail,
// Outlook e copiar o texto. Nada é enviado por este site.
export default function HelpMailButtons({ tool, area, format, primaryLabel = "Abrir o e-mail já preenchido" }: { tool?: string; area: string; format?: string; primaryLabel?: string }) {
  const opts = { tool, area, format };
  const to = helpContent(opts).to;
  const [copied, setCopied] = useState<"" | "ok" | "erro">("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copiar() {
    const text = helpPlainText(opts);
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch {
      try { // navegadores sem a área de transferência moderna
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); document.body.removeChild(ta);
      } catch { ok = false; }
    }
    setCopied(ok ? "ok" : "erro");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(""), 9000);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <a className="btn go" href={helpMailto(opts)}>{primaryLabel}</a>
        <a className="btn ghost" href={helpGmail(opts)} target="_blank" rel="noopener noreferrer">Abrir no Gmail</a>
        <a className="btn ghost" href={helpOutlook(opts)} target="_blank" rel="noopener noreferrer">Abrir no Outlook</a>
        <button className="btn ghost" type="button" onClick={copiar}>Copiar o texto</button>
      </div>
      <p className="count" role="status" aria-live="polite" style={{ marginTop: 8 }}>
        {copied === "ok"
          ? <>Copiado! Cole o texto em um e-mail novo para <b>{to}</b> e envie.</>
          : copied === "erro"
            ? <>Não consegui copiar. Escreva para <b>{to}</b> e conte sua área e um link do seu trabalho.</>
            : <>Se o seu computador não abrir o programa de e-mail, use o Gmail, o Outlook ou copie o texto. Ou escreva direto para <b>{to}</b>. Este site não envia nem guarda nada.</>}
      </p>
    </div>
  );
}
