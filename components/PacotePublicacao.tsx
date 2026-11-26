"use client";
import { useMemo, useState } from "react";
import { DESC_LIMIT, buildPublicacao } from "@/lib/publicacao";
import { CopyButton, useStored } from "@/components/tools/ui";

// Sugestões de título, descrição (com os capítulos), hashtags e comentário fixado, a partir do roteiro.
export default function PacotePublicacao({ raw, chapters, chaptersBlocked }: { raw: string; chapters: string; chaptersBlocked: boolean }) {
  const [saved, setSaved] = useStored<{ channel: string; cta: string; link: string }>("descricao-curta-canal", { channel: "", cta: "", link: "" });
  const [sel, setSel] = useState(0);
  const [subject, setSubject] = useState("");
  const pub = useMemo(
    () => buildPublicacao(raw, chapters, { channel: saved.channel ?? "", cta: saved.cta ?? "", link: saved.link ?? "", subject }),
    [raw, chapters, saved, subject]
  );
  if (!pub) return null;
  const i = Math.min(sel, pub.descriptions.length - 1);
  const desc = pub.descriptions[i];
  const hashtags = pub.hashtags.join(" ");

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
      <h3 style={{ margin: "0 0 4px" }}>Pacote de publicação</h3>
      <p className="note" style={{ marginTop: 0 }}>
        Sugestões montadas a partir do seu roteiro, sem IA. Leia e ajuste antes de publicar: elas são um ponto de partida.
      </p>

      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="pp-assunto">Assunto do vídeo (deixa os títulos melhores)</label>
        <input id="pp-assunto" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex.: narração em casa" />
      </div>
      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="pp-canal">Nome do canal (opcional)</label>
        <input id="pp-canal" value={saved.channel ?? ""} onChange={(e) => setSaved({ ...saved, channel: e.target.value })} placeholder="Ex.: Canal do João" />
      </div>
      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="pp-link">Link para colocar na descrição (opcional)</label>
        <input id="pp-link" value={saved.link ?? ""} onChange={(e) => setSaved({ ...saved, link: e.target.value })} placeholder="Ex.: https://..." />
      </div>

      <p className="count" style={{ marginTop: 16 }}><b>Títulos para testar</b>. Escolha um: a descrição abaixo combina com ele.</p>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        {pub.titles.map((t, k) => (
          <div key={k} className="out" style={{ borderColor: k === i ? "var(--blue)" : undefined }}>
            <div>{t.text}</div>
            <div className="note" style={{ margin: "4px 0 8px" }}>
              {t.kind} · {t.length} caracteres{t.length > 70 ? " (pode ficar cortado na busca)" : ""}
            </div>
            <div className="rrow">
              <button className="btn ghost" type="button" onClick={() => setSel(k)} aria-pressed={k === i}>{k === i ? "Usando na descrição" : "Usar na descrição"}</button>
              <CopyButton text={t.text} label="Copiar título" />
            </div>
          </div>
        ))}
      </div>

      <p className="count" style={{ marginTop: 16 }}><b>Descrição pronta</b>: {desc.length.toLocaleString("pt-BR")} de {DESC_LIMIT.toLocaleString("pt-BR")} caracteres.</p>
      {chaptersBlocked && <p className="note" style={{ marginTop: 4 }}>Os capítulos ainda não entram na descrição porque há avisos na lista de capítulos acima. Corrija-os e eles entram sozinhos.</p>}
      <div className="out" style={{ marginTop: 8 }}>{desc}</div>
      <div className="rrow" style={{ marginTop: 12 }}><CopyButton text={desc} label="Copiar descrição" /></div>

      {hashtags && (
        <>
          <p className="count" style={{ marginTop: 16 }}><b>Hashtags</b>. O YouTube costuma mostrar as 3 primeiras acima do título.</p>
          <div className="out" style={{ marginTop: 8 }}>{hashtags}</div>
          <div className="rrow" style={{ marginTop: 12 }}><CopyButton text={hashtags} label="Copiar hashtags" /></div>
        </>
      )}

      <p className="count" style={{ marginTop: 16 }}><b>Comentário fixado</b></p>
      <div className="out" style={{ marginTop: 8 }}>{pub.pinned}</div>
      <div className="rrow" style={{ marginTop: 12 }}><CopyButton text={pub.pinned} label="Copiar comentário" /></div>
    </div>
  );
}
