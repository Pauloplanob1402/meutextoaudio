"use client";
import { useEffect, useMemo, useState } from "react";
import { EMPTY_INPUTS, EXAMPLE_INPUTS, TECHNIQUES, fitOf, generateTitles, riskNotes, type TitleInputs } from "@/lib/titulos";
import { TITLE_LIMITS } from "@/lib/toolkit2";
import { CopyButton, useStored } from "./ui";

const NUMBERS = [3, 4, 5, 6, 7, 8, 9, 10, 12];

export default function TitleGenerator() {
  const [f, setF] = useStored<TitleInputs>("titulos-campos", EMPTY_INPUTS);
  const [favs, setFavs] = useStored<string[]>("titulos-favoritos", []);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const set = (patch: Partial<TitleInputs>) => setF({ ...EMPTY_INPUTS, ...f, ...patch });

  const { titles, locked, filled } = useMemo(() => generateTitles({ ...EMPTY_INPUTS, ...f }), [f]);
  const notes = useMemo(() => riskNotes({ ...EMPTY_INPUTS, ...f }), [f]);

  // se a pessoa mudou as lacunas, as edições antigas deixam de valer
  const key = JSON.stringify(f);
  useEffect(() => setEdits({}), [key]);

  const textOf = (id: string, generated: string) => edits[id] ?? generated;
  const toggleFav = (t: string) => setFavs(favs.includes(t) ? favs.filter((x) => x !== t) : [...favs, t]);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="g-acao">1. O que a pessoa quer fazer?</label>
        <input id="g-acao" type="text" value={f.acao ?? ""} onChange={(e) => set({ acao: e.target.value })} placeholder="gravar narração em casa" maxLength={80} />
        <span className="count">Comece com um verbo no infinitivo: gravar, editar, vender, estudar…</span>
      </div>
      <div className="field">
        <label htmlFor="g-assunto">2. Qual é o assunto?</label>
        <input id="g-assunto" type="text" value={f.assunto ?? ""} onChange={(e) => set({ assunto: e.target.value })} placeholder="narração em casa" maxLength={80} />
        <span className="count">Um nome, sem verbo: “edição de vídeo”, “finanças pessoais”.</span>
      </div>
      <div className="field">
        <label htmlFor="g-publico">3. Para quem? (opcional)</label>
        <input id="g-publico" type="text" value={f.publico ?? ""} onChange={(e) => set({ publico: e.target.value })} placeholder="iniciantes" maxLength={60} />
        <span className="count">Escreva no plural: “iniciantes”, “professores”, “mães de primeira viagem”.</span>
      </div>
      <div>
        <div className="field">
          <label htmlFor="g-res">Prazo ou resultado (opcional)</label>
          <input id="g-res" type="text" value={f.resultado ?? ""} onChange={(e) => set({ resultado: e.target.value })} placeholder="em 10 minutos" maxLength={60} />
        </div>
        <div className="field">
          <label htmlFor="g-sem">Sem o quê? (opcional)</label>
          <input id="g-sem" type="text" value={f.sem ?? ""} onChange={(e) => set({ sem: e.target.value })} placeholder="sem gastar com equipamento" maxLength={60} />
        </div>
        <div className="field">
          <label htmlFor="g-n">Número das listas</label>
          <select id="g-n" value={f.n ?? 5} onChange={(e) => set({ n: parseInt(e.target.value, 10) })}>
            {NUMBERS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div className="rrow">
        <button className="btn ghost" type="button" onClick={() => setF(EXAMPLE_INPUTS)}>Ver um exemplo</button>
        <button className="btn ghost" type="button" onClick={() => setF(EMPTY_INPUTS)} disabled={!(f.acao || f.assunto || f.publico || f.resultado || f.sem)}>Limpar</button>
      </div>

      {notes.length > 0 && (
        <ul className="problems" aria-live="polite" style={{ marginTop: 16 }}>{notes.map((n) => <li key={n}>{n}</li>)}</ul>
      )}

      {titles.length === 0 ? (
        <p className="note" aria-live="polite">Preencha o campo 1 ou o 2 para ver os títulos.</p>
      ) : (
        <div aria-live="polite">
          <p className="count" style={{ marginTop: 16 }}>
            {titles.length} {titles.length === 1 ? "título" : "títulos"}.{locked > 0 && !filled.publico ? " Preencha “Para quem” para liberar mais modelos." : ""}{locked > 0 && !(filled.acao && filled.assunto) ? " Preencha os campos 1 e 2 para ver todos." : ""}
          </p>
          {TECHNIQUES.map((tech) => {
            const list = titles.filter((t) => t.technique === tech.id);
            if (!list.length) return null;
            return (
              <div key={tech.id} style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 22 }}>{tech.name}</h2>
                <p className="count" style={{ margin: "4px 0 10px" }}>{tech.why}</p>
                <ul className="ideas">
                  {list.map((t) => {
                    const text = textOf(t.id, t.text);
                    const fit = fitOf(text);
                    const cls = fit.tooLong ? "bad" : fit.desktopCut ? "warn" : "ok";
                    const saved = favs.includes(text);
                    return (
                      <li key={t.id}>
                        <span className="badge">Gatilho: {TECHNIQUES.find((k) => k.id === t.technique)?.trigger}</span>
                        <input type="text" value={text} onChange={(e) => setEdits({ ...edits, [t.id]: e.target.value })} aria-label={`Título (${tech.name})`} style={{ margin: "6px 0 8px" }} />
                        <p className="count" style={{ marginBottom: 10 }}>
                          <b className={cls}>{fit.len}</b> caracteres{fit.tooLong ? " · passa do limite de 100 do YouTube" : fit.desktopCut ? ` · pode ser cortado (a partir de ~${TITLE_LIMITS.desktop})` : fit.mobileCut ? " · cabe no computador; no celular pode ser cortado" : " · cabe inteiro"}
                        </p>
                        <div className="rrow">
                          <CopyButton text={text} label="Copiar" />
                          <button className="btn ghost" type="button" onClick={() => toggleFav(text)} aria-pressed={saved}>{saved ? "Guardado ✓" : "Guardar"}</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {favs.length > 0 && (
        <div className="result">
          <h2>Seus guardados</h2>
          <ul className="dayitems" style={{ marginTop: 10 }}>
            {favs.map((t) => (
              <li key={t} style={{ gridTemplateColumns: "1fr auto" }}>
                <span>{t}</span>
                <button className="link" type="button" onClick={() => toggleFav(t)}>Tirar</button>
              </li>
            ))}
          </ul>
          <div className="rrow" style={{ marginTop: 12 }}>
            <CopyButton text={favs.join("\n")} label="Copiar todos" />
            <button className="btn ghost" type="button" onClick={() => setFavs([])}>Limpar guardados</button>
          </div>
        </div>
      )}

      <p className="note">Os modelos seguem estruturas clássicas de título (lista, passo a passo, pergunta, alerta, experiência). São pontos de partida: ajuste o texto para soar como você. O mais importante: o vídeo precisa cumprir o que o título promete. O YouTube pode remover ou reduzir o alcance de vídeos com título enganoso. Suas respostas e os títulos guardados ficam só neste aparelho.</p>
    </div>
  );
}
