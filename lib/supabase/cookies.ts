import type { CookieOptionsWithName } from "@supabase/ssr";

// Cookies da sessão: só trafegam por HTTPS em produção e não vão em pedidos de outros sites.
// httpOnly continua desligado de propósito: o login por link usa o cliente do navegador,
// que precisa ler/gravar esses cookies. A proteção contra roubo vem do CSP e de não haver HTML cru no site.
export const hardenCookie = <T extends Record<string, unknown>>(options: T | undefined) => ({
  ...(options ?? {}),
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
});

export const browserCookieOptions: CookieOptionsWithName = {
  sameSite: "lax",
  secure: typeof location !== "undefined" ? location.protocol === "https:" : false,
};
