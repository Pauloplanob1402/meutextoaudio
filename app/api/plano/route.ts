import { NextResponse } from "next/server";
import { getAccount } from "@/lib/entitlements";

// Diz ao navegador qual é o plano de quem está logado, só para liberar ou travar as vozes na tela.
// Não devolve e-mail nem dados da assinatura. Quem não está logado, ou se algo falhar, é tratado como Grátis.
export async function GET() {
  let plan: "free" | "pro" = "free";
  try {
    plan = (await getAccount())?.plan ?? "free";
  } catch {
    plan = "free";
  }
  return NextResponse.json({ plan }, { headers: { "Cache-Control": "private, no-store" } });
}
