import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: o antigo middleware.ts agora se chama proxy.ts.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Só roda onde há login. Páginas públicas e ferramentas não passam por aqui.
export const config = {
  matcher: ["/conta/:path*", "/login", "/auth/:path*", "/api/checkout", "/api/checkout-pix", "/api/cancelar", "/api/plano"],
};
