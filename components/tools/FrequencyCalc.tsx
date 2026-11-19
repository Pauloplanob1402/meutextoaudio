"use client";
import { planFrequency, rateLabel } from "@/lib/sistema2";
import { useStored } from "./ui";

type F = { hoursWeek: string; hoursPerVideo: string; subsNow: string; subsGoal: string; subsPerVideo: string };
const num = (s: string) => { const n = parseFloat(s.replace(",", ".")); return Number.isNaN(n) ? 0 : n; };
const FIELDS: { k: keyof F; label: string; hint: string }[] = [
  { k: "hoursWeek", label: "Horas por semana para o canal", hint: "Só o tempo que sobra de verdade." },
  { k: "hoursPerVideo", label: "Horas para fazer cada vídeo", hint: "Da ideia à publicação." },
  { k: "subsNow", label: "Inscritos hoje", hint: "" },
  { k: "subsGoal", label: "Meta de inscritos", hint: "Ex.: 1.000." },
  { k: "subsPerVideo", label: "Inscritos que cada vídeo traz, em média", hint: "Olhe os últimos vídeos no Studio." },
];

export default function FrequencyCalc() {
  const [f, setF] = useStored<F>("frequencia", { hoursWeek: "", hoursPerVideo: "", subsNow: "", subsGoal: "", subsPerVideo: "" });
  const r = planFrequency({ hoursWeek: num(f.hoursWeek), hoursPerVideo: num(f.hoursPerVideo), subsNow: num(f.subsNow), subsGoal: num(f.subsGoal), subsPerVideo: num(f.subsPerVideo) });

  return (
    <div className="tool">
      <div className="triple p3 rv">
        {FIELDS.map((x) => (
          <div className="field" key={x.k}>
            <label htmlFor={`fq-${x.k}`}>{x.label}</label>
            <input id={`fq-${x.k}`} type="text" inputMode="decimal" value={f[x.k]} onChange={(e) => setF({ ...f, [x.k]: e.target.value })} />
            {x.hint && <span className="count">{x.hint}</span>}
          </div>
        ))}
      </div>
      {!r.ok && <p className="note">{r.note}</p>}
      {r.ok && (
        <>
          <div className="big-out" aria-live="polite">
            <div className="num">{rateLabel(r.possible)}</div>
            <p className="count">é o ritmo que cabe no seu tempo. Para chegar à meta, são necessários cerca de {r.videosNeeded.toLocaleString("pt-BR")} vídeos.</p>
          </div>
          <ul className="rmetrics">
            {r.scenarios.map((s) => (
              <li key={s.perWeek} className={s.label === "Cabe no seu tempo" ? "lvl-otimo" : s.label === "Acima do seu tempo" ? "lvl-regular" : ""}>
                <b>{rateLabel(s.perWeek)}</b>
                <span>{s.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                <small>{s.weeks} {s.weeks === 1 ? "semana" : "semanas"} · {s.label}</small>
              </li>
            ))}
          </ul>
          <p className="note">{r.note}</p>
        </>
      )}
      <p className="note">É uma projeção simples, em linha reta: com a média de inscritos que você informou, sem contar que o canal costuma crescer mais rápido com o tempo (ou mais devagar se a constância falhar). Serve para dar uma ideia do caminho. Fica salvo só neste aparelho.</p>
    </div>
  );
}
