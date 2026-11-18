"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MISSIONS, challengeBadges, currentStreak, dayNumber, longestRun, PUBLISH_DAYS } from "@/lib/sistema";
import { getTool } from "@/lib/tools";
import { useStored } from "./ui";

type State = { start: string; done: number[] };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Challenge30() {
  const [st, setSt] = useStored<State>("desafio-30-dias", { start: "", done: [] });
  const [today, setToday] = useState("");
  const [sel, setSel] = useState(1);
  const [pick, setPick] = useState("");
  useEffect(() => { const t = iso(new Date()); setToday(t); setPick(t); }, []);
  useEffect(() => {
    if (st.start && today) { const n = dayNumber(st.start, today); setSel(Math.min(30, Math.max(1, n))); }
  }, [st.start, today]);

  if (!today) return <div className="tool"><p className="note">Carregando…</p></div>;

  if (!st.start) {
    return (
      <div className="tool">
        <p className="note">30 dias, uma missão por dia, 4 vídeos publicados no final. Cada missão leva uns 20 a 40 minutos e usa as ferramentas do site. É o caminho que quem começa costuma não ter.</p>
        <div className="field">
          <label htmlFor="ds">Quando você quer começar?</label>
          <div className="addrow">
            <input id="ds" type="date" value={pick} onChange={(e) => setPick(e.target.value)} />
            <button className="btn go" type="button" disabled={!pick} onClick={() => setSt({ start: pick, done: [] })}>Começar o desafio</button>
          </div>
        </div>
        <p className="note">Fica salvo só neste aparelho e neste navegador.</p>
      </div>
    );
  }

  const n = dayNumber(st.start, today);
  const set = new Set(st.done);
  const streak = currentStreak(st.done, n);
  const best = longestRun(st.done);
  const badges = challengeBadges(st.done);
  const m = MISSIONS[sel - 1];
  const toggle = (d: number) => setSt({ ...st, done: set.has(d) ? st.done.filter((x) => x !== d) : [...st.done, d] });
  const link = m.tool && getTool(m.tool) ? { href: `/ferramentas/${m.tool}`, label: getTool(m.tool)!.title } : null;
  const late = n > 30 && st.done.length < 30;
  const dayDate = (d: number) => {
    const [y, mo, da] = st.start.split("-").map(Number);
    return new Date(y, mo - 1, da + d - 1).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="tool">
      <div className="levelcard lv0">
        <div className="xp"><b>{st.done.length}</b> de 30 missões · sequência atual: <b>{streak}</b> {streak === 1 ? "dia" : "dias"}</div>
        <div className="meter" role="progressbar" aria-valuenow={Math.round((st.done.length / 30) * 100)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${(st.done.length / 30) * 100}%` }} /></div>
        <p className="count">{n < 1 ? `O desafio começa em ${dayDate(1)}.` : n <= 30 ? `Hoje é o dia ${n}.` : "O prazo de 30 dias passou, mas você pode terminar no seu ritmo."} Melhor sequência: {best} {best === 1 ? "dia" : "dias"}.</p>
      </div>

      <div className="dgrid" role="group" aria-label="Dias do desafio">
        {MISSIONS.map((x) => (
          <button key={x.day} type="button" onClick={() => setSel(x.day)} aria-label={`Dia ${x.day}${set.has(x.day) ? ", concluído" : ""}`} aria-pressed={sel === x.day}
            className={`dcell${set.has(x.day) ? " done" : ""}${x.day === n ? " today" : ""}${sel === x.day ? " sel" : ""}${x.publish ? " pub" : ""}`}>
            {x.day}
          </button>
        ))}
      </div>
      <p className="count">Os dias com o contorno amarelo são dias de publicar ({PUBLISH_DAYS.join(", ")}).</p>

      <div className="dayedit">
        <h3>Dia {sel} · {dayDate(sel)}{m.publish ? " · dia de publicar" : ""}</h3>
        <p className="mission">{m.text}</p>
        <div className="rrow">
          <button className={`btn ${set.has(sel) ? "ghost" : "go"}`} type="button" onClick={() => toggle(sel)}>{set.has(sel) ? "Desmarcar missão" : "Missão concluída"}</button>
          {link && <Link className="btn ghost" href={link.href}>Abrir: {link.label}</Link>}
        </div>
        {late && <p className="note">Atrasou? Sem problema: o que vale é terminar. Continue de onde parou.</p>}
      </div>

      <div className="field" style={{ marginTop: 24 }}>
        <span>Selos</span>
        <ul className="badges">
          {badges.map((b) => (
            <li key={b.id} className={b.earned ? "on" : ""}><b>{b.name}</b><small>{b.earned ? b.desc : `Falta: ${b.desc.toLowerCase()}`}</small></li>
          ))}
        </ul>
      </div>
      <div className="rrow">
        <button className="btn ghost" type="button" onClick={() => { if (window.confirm("Reiniciar o desafio? Você perde as marcações atuais.")) setSt({ start: "", done: [] }); }}>Reiniciar o desafio</button>
      </div>
      <p className="note">Fica salvo só neste aparelho e neste navegador.</p>
    </div>
  );
}
