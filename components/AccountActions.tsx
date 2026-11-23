"use client";
import { useEffect, useState } from "react";

type Props = { status: string | null; enabled: boolean; pix: boolean; active: boolean };

export default function AccountActions({ status, enabled, pix, active }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [pixData, setPixData] = useState<{ code: string; qr: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function call(path: string) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(path, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Algo deu errado. Tente de novo.");
      if (json.qr && json.code) { setPixData({ code: json.code, qr: json.qr }); return; }
      if (json.url) { location.href = json.url; return; }
      location.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  // Com o Pix na tela, confere de tempos em tempos se o pagamento já foi confirmado.
  useEffect(() => {
    if (!pixData) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch("/api/plano", { cache: "no-store" });
        const j = await r.json();
        if (j.plan === "pro") location.reload();
      } catch { /* tenta de novo no próximo ciclo */ }
    }, 5000);
    return () => clearInterval(t);
  }, [pixData]);

  async function copy() {
    if (!pixData) return;
    try {
      await navigator.clipboard.writeText(pixData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErr("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  }

  if (!enabled) return <p className="status">A assinatura do plano Criador ainda não está disponível. Em breve.</p>;

  if (pixData)
    return (
      <div role="status">
        <h2 style={{ fontSize: 22 }}>Pague com Pix</h2>
        <p className="note">Abra o app do seu banco, escolha Pix e leia o QR code ou use o código copia e cola. O código vale por 30 minutos. O plano é liberado assim que o pagamento for confirmado.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${pixData.qr}`} alt="QR code do Pix" width={220} height={220} style={{ margin: "16px 0", background: "#fff", padding: 8, borderRadius: 12 }} />
        <textarea readOnly value={pixData.code} rows={3} style={{ width: "100%", fontSize: 13 }} aria-label="Pix copia e cola" />
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn go" type="button" onClick={copy}>{copied ? "Código copiado!" : "Copiar código Pix"}</button>
          <button className="link" type="button" onClick={() => setPixData(null)}>Voltar</button>
        </div>
        {err && <p className="status" role="alert" style={{ marginTop: 12 }}>{err}</p>}
      </div>
    );

  return (
    <div>
      {active && !pix ? (
        <button className="btn ghost" type="button" disabled={busy}
          onClick={() => { if (confirm("Cancelar a assinatura? O acesso ao plano Criador termina agora e você não será cobrado de novo.")) call("/api/cancelar"); }}>
          {busy ? "Cancelando…" : "Cancelar assinatura"}
        </button>
      ) : (
        <>
          <div className="row">
            <button className="btn go" type="button" disabled={busy} onClick={() => call("/api/checkout-pix")}>
              {busy ? "Aguarde…" : active ? "Renovar 30 dias com Pix" : "Pagar 30 dias com Pix"}
            </button>
            {!active && (
              <button className="btn ghost" type="button" disabled={busy} onClick={() => call("/api/checkout")}>
                {status === "pending" ? "Tentar o cartão de novo" : "Assinar no cartão (renova sozinho)"}
              </button>
            )}
          </div>
          <p className="note" style={{ marginTop: 10 }}>O Pix vale por 30 dias e não renova sozinho. No cartão, a renovação é mensal e automática.</p>
        </>
      )}
      {err && <p className="status" role="alert" style={{ marginTop: 12 }}>{err}</p>}
    </div>
  );
}
