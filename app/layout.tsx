import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./ferramentas.css";
import "./legal.css";

export const metadata: Metadata = {
  title: "texto-áudio: cole o texto, ouça em segundos",
  description: "Transforme texto em áudio em português do Brasil, direto no navegador. Sem cadastro e sem enviar seu texto para ninguém.",
  openGraph: {
    title: "texto-áudio: cole o texto, ouça em segundos",
    description: "Áudio em português do Brasil, grátis e privado, direto no seu navegador.",
    type: "website",
  },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
