"use client";
import { useEffect, useRef } from "react";

// Verificação anti-robô do Cloudflare Turnstile. Só funciona se NEXT_PUBLIC_TURNSTILE_SITE_KEY existir.
// Modo "interaction-only": fica invisível e só pede algo à pessoa se o Cloudflare desconfiar.
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void };
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<TurnstileApi | null> {
  const w = window as unknown as { turnstile?: TurnstileApi };
  if (w.turnstile) return Promise.resolve(w.turnstile);
  return new Promise((resolve) => {
    let s = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (!s) { s = document.createElement("script"); s.src = SRC; s.async = true; document.head.appendChild(s); }
    s.addEventListener("load", () => resolve(w.turnstile ?? null));
    s.addEventListener("error", () => resolve(null));
  });
}

export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let id: string | undefined;
    let api: TurnstileApi | null = null;
    let gone = false;
    loadScript().then((t) => {
      api = t;
      if (gone || !t || !box.current) return;
      id = t.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: "interaction-only",
        language: "pt-br",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    });
    return () => { gone = true; if (id && api) { try { api.remove(id); } catch { /* ignora */ } } };
  }, [onToken]);
  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={box} style={{ marginTop: 12 }} />;
}
