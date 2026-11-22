"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STAGES, boardSummary, nextTask, newVideo, progressPct, stageDone, type Video } from "@/lib/sistema";
import { getTool } from "@/lib/tools";
import { addToCalendar, useStored } from "./ui";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function VideoBoard() {
  const [list, setList] = useStored<Video[]>("painel-videos", []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const v = list.find((x) => x.id === openId) ?? null;
  const save = (nv: Video) => setList(list.map((x) => (x.id === nv.id ? nv : x)));

  function add() {
    const nv = newVideo(name, today());
    setList([nv, ...list]);
    setName("");
    setOpenId(nv.id);
  }

  // ---------- lista ----------
  if (!v) {
    const sum = boardSummary(list);
    return (
      <div className="tool">
        <div className="field">
          <label htmlFor="nv">Novo vídeo</label>
          <div className="addrow">
            <input id="nv" type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="Título provisório ou ideia do vídeo" maxLength={120} />
            <button className="btn go" type="button" onClick={add}>Começar</button>
          </div>
        </div>

        {ready && list.length > 0 && <p className="count">{sum.active} em andamento · {sum.finished} concluídos{sum.inReview ? ` · ${sum.inReview} na revisão` : ""}</p>}

        {ready && list.length === 0 && (
          <p className="note">Cada vídeo anda pelas mesmas 8 etapas: ideia, título e miniatura, roteiro, gancho, áudio, publicação, no ar e revisão. É o processo que os canais grandes repetem em todo vídeo. Comece pelo primeiro acima.</p>
        )}

        <ul className="vlist">
          {list.map((x) => {
            const p = progressPct(x);
            const nt = x.done ? null : nextTask(x);
            return (
              <li key={x.id}>
                <button type="button" className="vcard" onClick={() => setOpenId(x.id)}>
                  <span className="badge">{x.done ? "Concluído" : `Etapa ${x.stage + 1} de ${STAGES.length}: ${STAGES[x.stage].title}`}</span>
                  <b className="vt">{x.title}</b>
                  <span className="meter"><i style={{ width: `${p}%` }} /></span>
                  <span className="count">{p}% pronto{nt ? ` · Próximo passo: ${nt}` : ""}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="note">Fica salvo só neste aparelho e neste navegador.</p>
      </div>
    );
  }

  // ---------- detalhe do vídeo ----------
  const s = STAGES[v.stage];
  const checked = v.checks[s.id] ?? [];
  const toggle = (id: string) => save({ ...v, checks: { ...v.checks, [s.id]: checked.includes(id) ? checked.filter((c) => c !== id) : [...checked, id] } });
  const go = (stage: number) => { setMsg(""); save({ ...v, stage }); };
  const last = v.stage === STAGES.length - 1;
  const links = s.tools.map((slug) => (slug === "/" ? { href: "/", label: "Texto em áudio" } : getTool(slug) ? { href: `/ferramentas/${slug}`, label: getTool(slug)!.title } : null)).filter(Boolean) as { href: string; label: string }[];

  function remove() {
    if (!window.confirm("Apagar este vídeo do painel? Isso não pode ser desfeito.")) return;
    setList(list.filter((x) => x.id !== v!.id));
    setOpenId(null);
  }
  function toCalendar() {
    if (!v!.date) return;
    setMsg(addToCalendar(v!.date, `Publicar: ${v!.title}`) ? "Colocado no calendário de conteúdo." : "Não foi possível salvar no calendário neste navegador.");
  }

  return (
    <div className="tool">
      <p className="crumb"><button className="link" type="button" onClick={() => setOpenId(null)}>← Todos os vídeos</button></p>
      <div className="field">
        <label htmlFor="vt">Título do vídeo</label>
        <input id="vt" type="text" value={v.title} onChange={(e) => save({ ...v, title: e.target.value })} maxLength={120} />
      </div>

      <ol className="path wiz" aria-label="Etapas do vídeo">
        {STAGES.map((st, i) => (
          <li key={st.id} className={v.stage === i ? "on" : stageDone(v, i) ? "done" : ""}>
            <button type="button" onClick={() => go(i)} aria-label={`Etapa ${i + 1}: ${st.title}`} title={st.title}><b>{i + 1}</b></button>
          </li>
        ))}
      </ol>
      <div className="meter" role="progressbar" aria-valuenow={progressPct(v)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progressPct(v)}%` }} /></div>

      <h2 className="steph">Etapa {v.stage + 1} de {STAGES.length}: {s.title}</h2>
      <p className="note">{s.why}</p>

      <ul className="checks">
        {s.tasks.map((t) => (
          <li key={t.id}>
            <label>
              <input type="checkbox" checked={checked.includes(t.id)} onChange={() => toggle(t.id)} />
              <span>{t.text}</span>
            </label>
          </li>
        ))}
      </ul>

      {links.length > 0 && (
        <div className="field">
          <span>Ferramentas desta etapa</span>
          <div className="aux">{links.map((l) => <Link key={l.href} className="chip" href={l.href}>{l.label}</Link>)}</div>
        </div>
      )}

      {s.id === "publicar" && (
        <div className="field">
          <label htmlFor="pd">Data de publicação</label>
          <div className="addrow">
            <input id="pd" type="date" value={v.date ?? ""} onChange={(e) => save({ ...v, date: e.target.value })} />
            <button className="btn ghost" type="button" onClick={toCalendar} disabled={!v.date}>Colocar no calendário</button>
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="nt">Anotações</label>
        <span className="count">{s.notes}</span>
        <textarea id="nt" value={v.notes[s.id] ?? ""} onChange={(e) => save({ ...v, notes: { ...v.notes, [s.id]: e.target.value } })} />
      </div>
      {msg && <p className="status" role="status">{msg}</p>}

      <div className="rrow">
        <button className="btn ghost" type="button" onClick={() => go(v.stage - 1)} disabled={v.stage === 0}>Etapa anterior</button>
        {!last ? (
          <button className="btn go" type="button" onClick={() => go(v.stage + 1)}>Próxima etapa</button>
        ) : (
          <button className="btn go" type="button" onClick={() => { save({ ...v, done: !v.done }); }}>{v.done ? "Reabrir vídeo" : "Concluir vídeo"}</button>
        )}
        <button className="btn ghost" type="button" onClick={remove}>Apagar vídeo</button>
      </div>
    </div>
  );
}
