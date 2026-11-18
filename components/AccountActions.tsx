"use client";
import { useState } from "react";

export default function AccountActions({ status, enabled }: { status: string | null; enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function call(path: string) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(path, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Algo deu errado. Tente de novo.");
      if (json.url) { location.href = json.url; return; }
      location.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) return <p className="status">A assinatura do plano Criador ainda não está disponível. Em breve.</p>;

  return (
    <div>
      {status === "authorized" ? (
        <button className="btn ghost" type="button" disabled={busy}
          onClick={() => { if (confirm("Cancelar a assinatura? O acesso ao plano Criador termina agora e você não será cobrado de novo.")) call("/api/cancelar"); }}>
          {busy ? "Cancelando…" : "Cancelar assinatura"}
        </button>
      ) : (
        <button className="btn go" type="button" disabled={busy} onClick={() => call("/api/checkout")}>
          {busy ? "Abrindo o pagamento…" : status === "pending" ? "Tentar o pagamento de novo" : "Assinar o plano Criador"}
        </button>
      )}
      {err && <p className="status" role="alert" style={{ marginTop: 12 }}>{err}</p>}
    </div>
  );
}
