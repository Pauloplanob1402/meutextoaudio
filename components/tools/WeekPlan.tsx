"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DAYS, DAY_LONG, buildPlan, dayDate, mondayOf } from "@/lib/planoSemana";
import { useStored } from "./ui";

export default function WeekPlan() {
  const [pub, setPub] = useStored<number[]>("semana-dias", [2, 4]); // quarta e sexta como ponto de partida
  const [done, setDone] = useStored<string[]>("semana-feitas", []);
  const [week, setWeek] = useState("");
  const [todayIdx, setTodayIdx] = useState(-1);
  useEffect(() => { const n = new Date(); setWeek(mondayOf(n)); setTodayIdx((n.getDay() + 6) % 7); }, []);
  if (!week) return <p className="note">Carregando…</p>;

  const plan = buildPlan(week, pub);
  const all = plan.byDay.flat();
  const finished = all.filter((t) => done.includes(t.key)).length;
  const toggleDay = (i: number) => setPub(pub.includes(i) ? pub.filter((x) => x !== i) : [...pub, i]);
  const toggle = (k: string) => setDone(done.includes(k) ? done.filter((x) => x !== k) : [...done, k]);
  // guarda só as marcas da semana atual
  const clear = () => setDone(done.filter((k) => !k.startsWith(`${week}:`)));

  return (
    <div className="tool">
      <div className="field">
        <span>Em quais dias da semana sai um vídeo?</span>
        <div className="speeds" role="group" aria-label="Dias de publicação">
          {DAYS.map((d, i) => (
            <button key={d} type="button" className={pub.includes(i) ? "on" : ""} aria-pressed={pub.includes(i)} onClick={() => toggleDay(i)}>{d}</button>
          ))}
        </div>
        <span className="count">Escolha um número que você consegue cumprir. Um vídeo por dia marcado.</span>
      </div>

      {plan.videos === 0 ? (
        <p className="note">Marque pelo menos um dia para montar o plano da semana.</p>
      ) : (
        <>
          <p className="note">Semana de {dayDate(week, 0)} a {dayDate(week, 6)} · <b>{plan.videos}</b> {plan.videos === 1 ? "vídeo" : "vídeos"} · <b>{finished} de {all.length}</b> tarefas feitas</p>
          {plan.byDay.map((tasks, i) => tasks.length > 0 && (
            <div key={i} className="field" style={i === todayIdx ? { borderLeft: "3px solid var(--blue)", paddingLeft: 12 } : undefined}>
              <span>{DAY_LONG[i]} {dayDate(week, i)}{i === todayIdx ? " (hoje)" : ""}{pub.includes(i) ? " · dia de publicar" : ""}</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {tasks.map((t) => (
                  <li key={t.key} style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
                    <label className="check">
                      <input type="checkbox" checked={done.includes(t.key)} onChange={() => toggle(t.key)} />{" "}
                      <span style={done.includes(t.key) ? { textDecoration: "line-through", opacity: 0.6 } : undefined}>Vídeo {t.video}: {t.stage.label}</span>
                    </label>
                    <div className="count" style={{ marginLeft: 26 }}>
                      {t.stage.tools.map((l, k) => <span key={l.href}>{k > 0 && " · "}<Link href={l.href}>{l.label}</Link></span>)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="row"><button className="btn ghost" type="button" onClick={clear}>Desmarcar tudo desta semana</button></div>
        </>
      )}
      <p className="note">As tarefas são distribuídas nos dias anteriores à publicação (as que cairiam antes de segunda ficam na segunda). Tudo fica só neste aparelho. Na semana seguinte o plano se monta de novo, com as marcas zeradas.</p>
    </div>
  );
}
