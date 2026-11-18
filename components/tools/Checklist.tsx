"use client";
import { LAUNCH_GROUPS, LAUNCH_ITEM_COUNT, XP_PER_ITEM, launchLevel } from "@/lib/toolkit2";
import { useStored } from "./ui";

type Stats = { launches: number; best: number };

export default function Checklist() {
  const [done, setDone] = useStored<string[]>("checklist-lancamento", []);
  const [stats, setStats] = useStored<Stats>("checklist-lancamento-stats", { launches: 0, best: 0 });
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);
  const count = done.length;
  const pct = Math.round((count / LAUNCH_ITEM_COUNT) * 100);
  const lv = launchLevel(pct);
  const complete = count === LAUNCH_ITEM_COUNT;

  function published() {
    setStats({ launches: stats.launches + 1, best: Math.max(stats.best, count) });
    setDone([]);
  }

  return (
    <div className="tool">
      <div className={`levelcard lv${lv.index}`} aria-live="polite">
        <span className="badge">{lv.name}</span>
        <div className="xp"><b>{count * XP_PER_ITEM}</b> de {LAUNCH_ITEM_COUNT * XP_PER_ITEM} pontos</div>
        <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
        <p className="count">{lv.msg}{lv.next ? ` Próximo nível: ${lv.next.name} (${lv.next.min}%).` : ""}</p>
      </div>

      {LAUNCH_GROUPS.map((g) => {
        const n = g.items.filter((it) => done.includes(it.id)).length;
        return (
          <div className="field" key={g.id}>
            <span>{g.title} <small className="count">({n}/{g.items.length}{n === g.items.length ? " · completo" : ""})</small></span>
            <ul className="checks">
              {g.items.map((it) => (
                <li key={it.id}>
                  <label>
                    <input type="checkbox" checked={done.includes(it.id)} onChange={() => toggle(it.id)} />
                    <span>{it.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="rrow">
        <button className="btn go" type="button" onClick={published} disabled={!complete}>Publiquei! Começar o próximo vídeo</button>
        <button className="btn ghost" type="button" onClick={() => setDone([])} disabled={!count}>Limpar marcações</button>
      </div>
      <p className="note">Vídeos publicados com o checklist completo: <b>{stats.launches}</b>{stats.best ? ` · melhor nota: ${Math.round((stats.best / LAUNCH_ITEM_COUNT) * 100)}%` : ""}. Tudo fica salvo só neste aparelho.</p>
    </div>
  );
}
