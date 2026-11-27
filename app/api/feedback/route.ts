import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { forbidden, sameOrigin } from "@/lib/origin";
import { getTool } from "@/lib/tools";

// Mensagens anônimas da caixa "o que faltou hoje?". Não guardamos e-mail, usuário nem IP.
// Freio simples por instância: no máximo 5 mensagens por minuto por origem de rede (guardado só na memória, sem gravar).
const hits = new Map<string, number[]>();
function tooMany(key: string) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  if (list.length >= 5) { hits.set(key, list); return true; }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 2000) hits.clear();
  return false;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  let body: { message?: unknown; tool?: unknown; site?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Pedido inválido." }, { status: 400 }); }
  if (typeof body.site === "string" && body.site) return NextResponse.json({ ok: true }); // campo-isca: robô preencheu, finge que deu certo

  const message = typeof body.message === "string" ? body.message.trim().replace(/\s+/g, " ") : "";
  if (message.length < 3) return NextResponse.json({ error: "Escreva pelo menos uma frase curta." }, { status: 400 });
  if (message.length > 500) return NextResponse.json({ error: "Use até 500 caracteres." }, { status: 400 });
  const tool = typeof body.tool === "string" && getTool(body.tool) ? body.tool : "geral";

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
  if (tooMany(ip)) return NextResponse.json({ error: "Muitas mensagens seguidas. Tente de novo em um minuto." }, { status: 429 });

  try {
    const { error } = await createAdminClient().from("feedback").insert({ tool, message });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("feedback falhou:", e);
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente de novo em instantes." }, { status: 503 });
  }
}
