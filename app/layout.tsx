import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./ferramentas.css";
import "./ferramentas2.css";
import "./legal.css";
import "./sauim.css";
import ToolHost from "@/components/ToolHost";
import GeracaoBar from "@/components/GeracaoBar";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://sauim.com.br"),
  title: "Sauim — Comece pequeno. Cresça gigante. | Ferramentas para criadores de YouTube",
  description: "Texto em áudio em português do Brasil e ferramentas para criadores de YouTube: roteiro, capítulos, legendas, miniatura e planejamento.",
  openGraph: {
    title: "Sauim — Comece pequeno. Cresça gigante.",
    description: "Do roteiro à publicação: narração, títulos, capítulos, legendas e miniatura para criadores de YouTube.",
    siteName: "Sauim",
    locale: "pt_BR",
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
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <ToolHost />
        <GeracaoBar />
      </body>
    </html>
  );
}
