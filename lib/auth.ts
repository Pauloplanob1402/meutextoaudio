// Só aceita caminhos internos (evita redirecionar para sites de terceiros).
export function safeNext(n?: string | null) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/conta";
}
