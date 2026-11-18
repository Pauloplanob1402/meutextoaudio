import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import ToolView from "@/components/tools/ToolView";
import { TOOLS, getTool } from "@/lib/tools";

export const dynamicParams = false;
export const generateStaticParams = () => TOOLS.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = getTool((await params).slug);
  return t ? { title: `${t.title} · Saium`, description: t.intro } : {};
}

export default async function FerramentaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  // sugestões discretas: primeiro as do mesmo grupo
  const also = [...TOOLS.filter((t) => t.group === tool.group && t.slug !== slug), ...TOOLS.filter((t) => t.group !== tool.group && t.start && t.slug !== slug)].slice(0, 3);

  return (
    <Shell>
      <div className="tp">
        <p className="crumb"><Link href="/ferramentas">← Todas as ferramentas</Link></p>
        <h1>{tool.title}</h1>
        <p className="lead">{tool.intro}</p>
        <ToolView slug={slug} />
        <p className="also">
          Veja também: {also.map((t, i) => (<span key={t.slug}>{i > 0 && " · "}<Link href={`/ferramentas/${t.slug}`}>{t.title}</Link></span>))}
        </p>
      </div>
    </Shell>
  );
}
