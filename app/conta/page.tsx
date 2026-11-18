import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import AccountActions from "@/components/AccountActions";
import { getAccount } from "@/lib/entitlements";
import { billingEnabled } from "@/lib/billing";

export const metadata: Metadata = { title: "Minha conta · Saium", robots: { index: false } };

const LABEL: Record<string, string> = {
  authorized: "Plano Criador ativo",
  pending: "Aguardando a confirmação do pagamento",
  paused: "Assinatura pausada",
  cancelled: "Assinatura cancelada",
};

export default async function Conta({ searchParams }: { searchParams: Promise<{ retorno?: string }> }) {
  const { retorno } = await searchParams;
  const account = await getAccount();
  if (!account) redirect("/login?next=/conta");

  return (
    <Shell>
      <div className="auth tool">
        <h1>Minha conta</h1>
        <p className="lead">{account.email}</p>

        {retorno && account.status !== "authorized" && (
          <p className="status" role="status">Estamos confirmando o seu pagamento. Pode levar alguns minutos. Atualize esta página para ver o resultado.</p>
        )}

        <h2>Plano: {account.plan === "pro" ? "Criador" : "Grátis"}</h2>
        {account.status && <p className="status">{LABEL[account.status] ?? account.status}</p>}
        {account.status === "authorized" && account.nextPayment && (
          <p className="note">Próxima cobrança: {new Date(account.nextPayment).toLocaleDateString("pt-BR")}</p>
        )}

        <div style={{ margin: "20px 0" }}>
          <AccountActions status={account.status} enabled={billingEnabled()} />
        </div>

        <form action="/auth/sair" method="post">
          <button className="link" type="submit">Sair da conta</button>
        </form>
      </div>
    </Shell>
  );
}
