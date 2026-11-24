"use client";
import { useEffect, useMemo, useState } from "react";
import { DESC_LIMIT, SIZES, buildDescriptions } from "@/lib/descricao";
import { CopyButton, useStored } from "./ui";

export default function ScriptDescription() {
  const [script, setScript] = useState("");
  const [subject, setSubject] = useState("");
  const [saved, setSaved] = useStored<{ channel: string; cta: string; link: string }>("descricao-curta-canal", { channel: "", cta: "", link: "" });
  const [size, setSize] = useState<number>(1200);
  const [msg, setMsg] = useState("");

  // se a pessoa já escreveu um roteiro no Texto em áudio, ele aparece aqui
  useEffect(() => {
    try { const d = localStorage.getItem("draft"); if (d) setScript(d); } catch {}
  }, []);

  const result = useMemo(
    () => (script.trim().length > 40 ? buildDescriptions(script, { subject, channel: saved.channel, cta: saved.cta, link: saved.link ?? "", size }) : null),
    [script, subject, saved, size]
  );

  function fromAudio() {
    try {
      const d = localStorage.getItem("draft");
      if (d) { setScript(d); setMsg("Roteiro do Texto em áudio carregado."); } else setMsg("Não há roteiro salvo no Texto em áudio.");
    } catch { setMsg("Não foi possível ler o texto neste navegador."); }
  }

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="ds-r">Roteiro do vídeo</label>
        <textarea id="ds-r" value={script} onChange={(e) => setScript(e.target.value)} style={{ minHeight: 160 }} placeholder="Cole aqui o texto do vídeo, o mesmo que você usa no Texto em áudio." />
        <div className="aux">
          <button className="chip" type="button" onClick={fromAudio}>Usar o texto do Texto em áudio</button>
          {script && <button className="chip" type="button" onClick={() => { setScript(""); setMsg(""); }}>Limpar</button>}
        </div>
        {msg && <span className="count" role="status">{msg}</span>}
      </div>

      <div className="field">
        <label htmlFor="ds-a">Assunto do vídeo (recomendado)</label>
        <input id="ds-a" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex.: texto em áudio, ganhar inscritos, edição no celular" />
        <span className="count">Se ficar vazio, usamos as palavras que mais aparecem no roteiro{result && result.keywords.length ? `: ${result.keywords.slice(0, 2).join(", ")}` : ""}.</span>
      </div>
      <div className="field">
        <label htmlFor="ds-c">Nome do canal (opcional, fica salvo)</label>
        <input id="ds-c" type="text" value={saved.channel} onChange={(e) => setSaved({ ...saved, channel: e.target.value })} placeholder="Ex.: Canal do Paulo" />
      </div>
      <div className="field">
        <label htmlFor="ds-k">Convite final (opcional, fica salvo)</label>
        <input id="ds-k" type="text" value={saved.cta} onChange={(e) => setSaved({ ...saved, cta: e.target.value })} placeholder="Ex.: Gostou? Inscreva-se e ative o sininho." />
      </div>

      <div className="field">
        <label htmlFor="ds-l">Link para a descrição (opcional, fica salvo)</label>
        <input id="ds-l" type="text" value={saved.link ?? ""} onChange={(e) => setSaved({ ...saved, link: e.target.value })} placeholder="Ex.: https://sauim.com.br" />
      </div>
      <div className="field">
        <span>Tamanho</span>
        <div className="speeds" role="group" aria-label="Tamanho da descrição">
          {SIZES.map((s) => (
            <button key={s.id} type="button" className={size === s.id ? "on" : ""} onClick={() => setSize(s.id)}>{s.label}</button>
          ))}
        </div>
        <span className="count">O YouTube aceita até {DESC_LIMIT.toLocaleString("pt-BR")} caracteres. Só os primeiros 150 aparecem antes do “mostrar mais”.</span>
      </div>

      <h2 className="steph">Descrições prontas</h2>
      {!result && <p className="note">Cole o roteiro acima para ver as três opções.</p>}
      {result?.variants.map((v, i) => (
        <div key={i} style={{ marginTop: 18 }}>
          <p className="count"><b>Opção {i + 1} · {v.kind}</b></p>
          <div className="out" style={{ whiteSpace: "pre-wrap" }}>{v.text}</div>
          <p className="count"><b className={v.text.length > DESC_LIMIT ? "bad" : ""}>{v.text.length.toLocaleString("pt-BR")}</b> de {DESC_LIMIT.toLocaleString("pt-BR")} caracteres · aparece antes do “mostrar mais”: {Math.min(v.text.length, 150)}</p>
          <div className="rrow"><CopyButton text={v.text} label="Copiar descrição" /></div>
        </div>
      ))}
      <p className="note">Feito por regras, sem inteligência artificial: a frase de abertura segue fórmulas de título e o resumo vem das frases do seu roteiro que mais repetem o assunto. Leia, troque o que quiser e cole no YouTube. Nada sai do seu aparelho.</p>
    </div>
  );
}
