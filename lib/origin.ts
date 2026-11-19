// Defesa extra contra pedidos disparados por outros sites (CSRF) nas rotas que mudam algo.
// Navegadores sempre mandam Sec-Fetch-Site ou Origin em POST; quem não manda (curl, scripts) é recusado.
export function sameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const forbidden = () => new Response("Pedido recusado.", { status: 403 });
