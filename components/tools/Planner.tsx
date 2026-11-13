"use client";
import { useStored } from "./ui";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
type Plan = { idea: string; done: boolean }[];
const empty = (): Plan => DAYS.map(() => ({ idea: "", done: false }));

export default function Planner() {
  const [plan, setPlan] = useStored<Plan>("planner-semanal", empty());
  const safe = DAYS.map((_, i) => plan[i] ?? { idea: "", done: false });
  const update = (i: number, patch: Partial<Plan[number]>) => setPlan(safe.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <div className="tool">
      <ul className="week">
        {DAYS.map((d, i) => (
          <li key={d}>
            <label htmlFor={`d${i}`}>{d}</label>
            <input id={`d${i}`} type="text" value={safe[i].idea} onChange={(e) => update(i, { idea: e.target.value })} placeholder="Ideia ou título do dia" className={safe[i].done ? "done" : ""} />
            <label className="inline"><input type="checkbox" checked={safe[i].done} onChange={(e) => update(i, { done: e.target.checked })} /> Publicado</label>
          </li>
        ))}
      </ul>
      <div className="rrow">
        <button className="btn ghost" type="button" onClick={() => setPlan(empty())} disabled={!safe.some((p) => p.idea || p.done)}>Limpar a semana</button>
      </div>
      <p className="note">Fica salvo só neste aparelho e neste navegador.</p>
    </div>
  );
}
