import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

// Cabeçalho e rodapé das páginas internas
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="wrap"><main>{children}</main></div>
      <SiteFooter />
    </>
  );
}
