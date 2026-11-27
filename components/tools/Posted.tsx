"use client";
import { useEffect, useState } from "react";
import { computeStats, fmtDay, isoDay, type Posted } from "@/lib/saiuUm";
import { useStored } from "./ui";

export default function PostedCounter() {
  const [items, setItems] = useStored<Posted[]>("saiu-um", []);
  const [goal, setGoal] = useStored<number>("saiu-um-meta", 1);
  const [title, setTitle] = useState("");
  const [today, setToday] = useState("");
  const [flash, setFlash] = useState("");
  useEffect(() => { setToday(isoDay(new Date())); }, []);
  if (!today) return <p className="note">Carregando…</p>;

  const s = computeStats(items, goal, today);
  const max = Math.max(s.goal, ...s.weeks.map((w) => w.count), 1);
  const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id.localeCompare(a.id)));

  function saiu() {
    const id = `${Date.now()}`;
    setItems([...items, { id, date: today, title: title.trim() }]);
    setTitle("");
    const next = s.thisWeek + 1;
    setFlash(next >= s.goal && s.thisWeek < s.goal ? "Saiu um! Meta da semana batida." : "Saiu um! Mais um vídeo no ar.");
  }
  const remove = (id: string) => { setItems(items.filter((x) => x.id !== id)); setFlash(""); };

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="su">Nome do vídeo que saiu (opcional)</label>
        <input id="su" type="text" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saiu(); }} placeholder="Ex.: Como gravar sem aparecer" />
      </div>
      <div className="row">
        <button className="btn go" type="button" onClick={saiu}>Saiu um!</button>
        <p className="status" role="status" aria-live="polite">{flash}</p>
      </div>

      <div className="result">
        <h2>{s.streak > 0 ? `${s.streak} ${s.streak === 1 ? "semana seguida" : "semanas seguidas"}` : "Sua sequência começa com o próximo vídeo"}</h2>
        <p className="note">
          Esta semana: <b>{s.thisWeek} de {s.goal}</b>{s.weekDone ? " (meta batida)" : ""} · Neste mês: <b>{s.month}</b> · Total: <b>{s.total}</b> · Melhor sequência: <b>{s.best}</b>
        </p>
        <div aria-label="Vídeos por semana, últimas 8 semanas" role="img" style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90, margin: "12px 0 4px" }}>
          {s.weeks.map((w) => (
            <div key={w.start} title={`Semana de ${fmtDay(w.start)}: ${w.count}`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ height: `${Math.max((w.count / max) * 100, w.count ? 8 : 3)}%`, background: w.count >= s.goal ? "#2f7d4f" : w.count ? "#b7791f" : "var(--line)", borderRadius: 4 }} />
            </div>
          ))}
        </div>
        <p className="count">Últimas 8 semanas (verde: meta batida). O que conta é o que você controla: vídeos publicados, não visualizações.</p>
      </div>

      <div className="field">
        <span>Meta de vídeos por semana</span>
        <div className="speeds" role="group" aria-label="Meta semanal">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className={goal === n ? "on" : ""} onClick={() => setGoal(n)}>{n}</button>
          ))}
        </div>
        <span className="count">Comece com uma meta que você consegue cumprir sem sofrer. A sequência conta semanas seguidas que bateram a meta; a semana em andamento ainda não quebra a sequência.</span>
      </div>

      {sorted.length > 0 && (
        <div className="field">
          <span>Vídeos que saíram</span>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sorted.slice(0, 30).map((p) => (
              <li key={p.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--line)" }}>
                <b style={{ minWidth: 56 }}>{fmtDay(p.date)}</b>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title || "Sem nome"}</span>
                <button className="chip" type="button" onClick={() => remove(p.id)} aria-label={`Remover o vídeo de ${fmtDay(p.date)}`}>Remover</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="note">Os dados ficam só neste aparelho e neste navegador. Se limpar os dados do navegador, a contagem some.</p>
    </div>
  );
}
