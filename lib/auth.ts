// Só aceita caminhos internos (evita redirecionar para sites de terceiros).
// Atenção: o navegador trata "\" como "/", então "/\site.com" levaria para fora do site.
// Por isso o endereço é resolvido de verdade e só passa se continuar no mesmo site.
export function safeNext(n?: string | null) {
  const fallback = "/conta";
  if (!n || !n.startsWith("/") || n.startsWith("//") || /[\\\u0000-\u001f]/.test(n)) return fallback;
  try {
    const u = new URL(n, "http://interno.local");
    if (u.origin !== "http://interno.local") return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
