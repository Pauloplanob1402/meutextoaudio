// Recebe os avisos do CSP (navegador -> aqui) e escreve uma linha curta no log da Vercel.
// Serve para descobrir, no modo "só relatório", o que a política bloquearia antes de ligá-la de verdade.
export async function POST(request: Request) {
  try {
    const text = (await request.text()).slice(0, 4000); // limite de tamanho
    const raw = JSON.parse(text);
    const list = Array.isArray(raw) ? raw : [raw];
    for (const item of list.slice(0, 5)) {
      const r = item?.["csp-report"] ?? item?.body ?? {};
      const clean = (v: unknown) => String(v ?? "").replace(/[\r\n]/g, " ").slice(0, 160);
      console.warn("csp:", clean(r["violated-directive"] ?? r.effectiveDirective), "|", clean(r["blocked-uri"] ?? r.blockedURL), "|", clean(r["document-uri"] ?? r.documentURL));
    }
  } catch {
    /* relatório inválido: ignora */
  }
  return new Response(null, { status: 204 });
}
