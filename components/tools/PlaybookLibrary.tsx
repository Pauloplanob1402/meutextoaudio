"use client";
import { useState } from "react";
import { BLOCK_IDS, PLAYBOOKS, composeBlocks, filledCount } from "@/lib/playbooks";
import { SCRIPT_BLOCKS } from "@/lib/toolkit2";
import { CopyButton, downloadText, useStored } from "./ui";

export default function PlaybookLibrary() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [vals, setVals] = useStored<Record<string, Record<string, string>>>("playbooks-respostas", {});
  const [script, setScript] = useStored<Record<string, string>>("roteiro-blocos", {});
  const [msg, setMsg] = useState("");
  const p = PLAYBOOKS.find((x) => x.id === openId) ?? null;

  if (!p) {
    return (
      <div className="tool">
        <p className="note">São estruturas de vídeo muito usadas por canais de todos os tamanhos. Escolha uma, preencha as lacunas e leve o roteiro pronto para a ferramenta Roteiro em blocos.</p>
        <div className="cards" style={{ marginTop: 16 }}>
          {PLAYBOOKS.map((x) => (
            <button key={x.id} type="button" className="tcard pcard" onClick={() => { setOpenId(x.id); setMsg(""); }}>
              <h3>{x.name}</h3>
              <p>{x.short}</p>
              <span className="count">{x.length}{filledCount(x, vals[x.id] ?? {}) ? ` · ${filledCount(x, vals[x.id] ?? {})}/${x.fields.length} campos preenchidos` : ""}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const v = vals[p.id] ?? {};
  const blocks = composeBlocks(p, v);
  const full = SCRIPT_BLOCKS.map((b) => `[${b.title.toUpperCase()}]\n${blocks[b.id as keyof typeof blocks]}`).join("\n\n");

  function sendToScript() {
    const has = Object.values(script).some((t) => (t ?? "").trim());
    if (has && !window.confirm("O Roteiro em blocos já tem texto. Substituir pelo roteiro deste playbook?")) return;
    const next: Record<string, string> = {};
    for (const b of BLOCK_IDS) next[b] = blocks[b];
    setScript(next);
    setMsg("Roteiro enviado. Abra o Roteiro em blocos para ver o tempo de cada parte.");
  }

  return (
    <div className="tool">
      <p className="crumb"><button className="link" type="button" onClick={() => setOpenId(null)}>← Todos os playbooks</button></p>
      <h2 className="steph">{p.name}</h2>
      <ul className="pinfo">
        <li><b>Quando usar:</b> {p.when}</li>
        <li><b>Por que funciona:</b> {p.why}</li>
        <li><b>Cuidado:</b> {p.trap}</li>
        <li><b>Duração comum:</b> {p.length}</li>
      </ul>

      <div className="triple p3 rv">
        {p.fields.map((f) => (
          <div className="field" key={f.id}>
            <label htmlFor={`pf-${f.id}`}>{f.label}</label>
            <input id={`pf-${f.id}`} type="text" value={v[f.id] ?? ""} onChange={(e) => setVals({ ...vals, [p.id]: { ...v, [f.id]: e.target.value } })} placeholder={`Ex.: ${f.example}`} />
          </div>
        ))}
      </div>
      <div className="rrow" style={{ marginBottom: 12 }}>
        <button className="chip" type="button" onClick={() => setVals({ ...vals, [p.id]: Object.fromEntries(p.fields.map((f) => [f.id, f.example])) })}>Preencher com o exemplo</button>
        <button className="chip" type="button" onClick={() => setVals({ ...vals, [p.id]: {} })}>Limpar campos</button>
      </div>

      <ol className="blocks scriptblocks">
        {SCRIPT_BLOCKS.map((b, i) => (
          <li key={b.id}>
            <div className="blockhead"><h3>{i + 1}. {b.title}</h3><span className="count">{b.range}</span></div>
            <p>{blocks[b.id as keyof typeof blocks]}</p>
          </li>
        ))}
      </ol>

      <div className="rrow">
        <button className="btn go" type="button" onClick={sendToScript}>Enviar para o Roteiro em blocos</button>
        <CopyButton text={full} label="Copiar roteiro" />
        <button className="btn ghost" type="button" onClick={() => downloadText(full, `roteiro-${p.id}.txt`)}>Baixar .txt</button>
      </div>
      {msg && <p className="status" role="status">{msg}</p>}
      <p className="note">Os trechos entre [colchetes] são para você completar com o seu assunto. Estas estruturas são um ponto de partida, não garantia de resultado: teste e ajuste com os números da Revisão do vídeo.</p>
    </div>
  );
}
