import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import AccountActions from "@/components/AccountActions";
import { getAccount } from "@/lib/entitlements";
import { billingEnabled } from "@/lib/billing";
import { ANNUAL, PRICE, brl } from "@/lib/brand";

export const metadata: Metadata = { title: "Minha conta · Sauim", robots: { index: false } };

const LABEL: Record<string, string> = {
  authorized: "Plano Criador ativo",
  expired: "Plano Criador vencido",
  pending: "Aguardando a confirmação do pagamento",
  paused: "Assinatura pausada",
  cancelled: "Assinatura cancelada",
};

export default async function Conta({ searchParams }: { searchParams: Promise<{ retorno?: string; plano?: string }> }) {
  const { retorno, plano } = await searchParams;
  const account = await getAccount();
  if (!account) redirect(plano === "anual" ? "/login?next=%2Fconta%3Fplano%3Danual" : "/login?next=/conta");

  const keepsAccess = account.plan === "pro" && account.status === "cancelled";

  return (
    <Shell>
      <div className="auth tool">
        <h1>Minha conta</h1>
        <p className="lead">{account.email}</p>

        {retorno && account.status !== "authorized" && (
          <p className="status" role="status">Estamos confirmando o seu pagamento. Pode levar alguns minutos. Atualize esta página para ver o resultado.</p>
        )}

        <h2>Plano: {account.plan === "pro" ? `Criador ${account.period === "annual" ? "(anual)" : "(mensal)"}` : "Grátis"}</h2>
        {account.status && <p className="status">{account.pix && account.plan !== "pro" && account.status === "authorized" ? LABEL.expired : keepsAccess ? "Renovação cancelada" : LABEL[account.status] ?? account.status}</p>}
        {account.status === "authorized" && account.nextPayment && (
          <p className="note">{account.pix ? "Acesso até" : "Próxima cobrança"}: {new Date(account.nextPayment).toLocaleDateString("pt-BR")}</p>
        )}
        {keepsAccess && account.accessUntil && (
          <p className="note">Você segue com o plano Criador até {new Date(account.accessUntil).toLocaleDateString("pt-BR")}, o fim do período que você já pagou. Depois disso, nada será cobrado.</p>
        )}

        <div style={{ margin: "20px 0" }}>
          <AccountActions
            status={account.status}
            enabled={billingEnabled()}
            pix={account.pix}
            active={account.plan === "pro"}
            annualPlan={account.period === "annual"}
            initialPeriod={plano === "anual" ? "annual" : "monthly"}
            prices={{ monthly: brl(PRICE.criador), annual: brl(ANNUAL.price), perMonth: brl(ANNUAL.perMonth), saving: brl(ANNUAL.saving), free: ANNUAL.freeLabel }}
          />
        </div>

        <form action="/auth/sair" method="post">
          <button className="link" type="submit">Sair da conta</button>
        </form>
      </div>
    </Shell>
  );
}
