"use client";
import { useEffect, useMemo, useState } from "react";
import { monthGrid, ymd } from "@/lib/toolkit";
import { useStored } from "./ui";

type Item = { id: string; text: string; done: boolean };
type Data = Record<string, Item[]>;

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const toDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function Calendar() {
  const [data, setData] = useStored<Data>("calendario-conteudo", {});
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [today, setToday] = useState("");
  const [draft, setDraft] = useState("");

  // a data de hoje só existe no navegador (a página é gerada antes, no servidor)
  useEffect(() => {
    const n = new Date();
    setView({ y: n.getFullYear(), m: n.getMonth() });
    setSel(ymd(n));
    setToday(ymd(n));
  }, []);

  const weeks = useMemo(() => (view ? monthGrid(view.y, view.m) : []), [view]);
  if (!view || !sel) return <div className="tool"><p className="note">Carregando…</p></div>;

  const items = (d: string) => data[d] ?? [];
  const setDay = (d: string, list: Item[]) => {
    const next = { ...data };
    if (list.length) next[d] = list;
    else delete next[d];
    setData(next);
  };

  const prefix = `${view.y}-${String(view.m + 1).padStart(2, "0")}-`;
  const monthItems = Object.entries(data).filter(([d]) => d.startsWith(prefix)).flatMap(([, l]) => l);
  const planned = monthItems.length;
  const done = monthItems.filter((i) => i.done).length;
  const monthLabel = cap(new Date(view.y, view.m, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));

  function go(delta: number) {
    const d = new Date(view!.y, view!.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setSel(ymd(d));
  }
  function goToday() {
    const n = new Date();
    setView({ y: n.getFullYear(), m: n.getMonth() });
    setSel(ymd(n));
  }
  function add() {
    const text = draft.trim();
    if (!text) return;
    setDay(sel!, [...items(sel!), { id: newId(), text, done: false }]);
    setDraft("");
  }
  const patch = (id: string, p: Partial<Item>) => setDay(sel!, items(sel!).map((i) => (i.id === id ? { ...i, ...p } : i)));
  const remove = (id: string) => setDay(sel!, items(sel!).filter((i) => i.id !== id));

  const selLabel = cap(toDate(sel).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }));

  return (
    <div className="tool">
      <div className="calhead">
        <button className="btn ghost" type="button" aria-label="Mês anterior" onClick={() => go(-1)}>←</button>
        <h2 className="calmonth" aria-live="polite">{monthLabel}</h2>
        <button className="btn ghost" type="button" aria-label="Próximo mês" onClick={() => go(1)}>→</button>
      </div>
      <div className="rrow" style={{ justifyContent: "space-between" }}>
        <p className="count" aria-live="polite">
          {planned ? <><b>{planned}</b> {planned === 1 ? "ideia" : "ideias"} no mês · <b className="ok">{done}</b> {done === 1 ? "publicada" : "publicadas"}</> : "Nenhuma ideia neste mês ainda. Clique em um dia para começar."}
        </p>
        <button className="link" type="button" onClick={goToday}>Ir para hoje</button>
      </div>

      <div className="cal">
        {DOW.map((d) => <div className="dow" key={d}>{d}</div>)}
        {weeks.flat().map((c) => {
          const list = items(c.date);
          const label = `${toDate(c.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}${list.length ? `, ${list.length} ${list.length === 1 ? "ideia" : "ideias"}` : ""}`;
          return (
            <button
              key={c.date}
              type="button"
              className={`day${c.inMonth ? "" : " out"}${c.date === today ? " today" : ""}${c.date === sel ? " sel" : ""}`}
              aria-label={label}
              aria-pressed={c.date === sel}
              onClick={() => { setSel(c.date); if (!c.inMonth) { const d = toDate(c.date); setView({ y: d.getFullYear(), m: d.getMonth() }); } }}
            >
              <span className="n">{c.day}</span>
              {list.slice(0, 2).map((i) => <span key={i.id} className={`it${i.done ? " done" : ""}`}>{i.text}</span>)}
              {list.length > 2 && <span className="cal-more">+{list.length - 2}</span>}
              {list.length > 0 && <span className="cnt" aria-hidden="true">{list.length}</span>}
            </button>
          );
        })}
      </div>

      <div className="dayedit">
        <h3>{selLabel}</h3>
        {items(sel).length > 0 && (
          <ul className="dayitems">
            {items(sel).map((i) => (
              <li key={i.id}>
                <input type="checkbox" checked={i.done} onChange={(e) => patch(i.id, { done: e.target.checked })} aria-label="Publicado" />
                <input type="text" value={i.text} onChange={(e) => patch(i.id, { text: e.target.value })} className={i.done ? "done" : ""} aria-label="Ideia" />
                <button className="link" type="button" onClick={() => remove(i.id)}>Remover</button>
              </li>
            ))}
          </ul>
        )}
        <div className="addrow">
          <input id="newitem" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="Ideia ou título para este dia" aria-label="Nova ideia" />
          <button className="btn" type="button" onClick={add} disabled={!draft.trim()}>Adicionar</button>
        </div>
      </div>
      <p className="note">Marque a caixinha quando o vídeo for publicado. Tudo fica salvo só neste aparelho e neste navegador.</p>
    </div>
  );
}
