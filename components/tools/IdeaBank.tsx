"use client";
import { useEffect, useState } from "react";
import { allTags, filterIdeas, parseIdeaInput, type IdeaItem, type IdeaStatus } from "@/lib/sistema3";
import { newVideo, type Video } from "@/lib/sistema";
import { CopyButton, addToCalendar, downloadText, useStored } from "./ui";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const STATUS: { v: IdeaStatus | "todas"; label: string }[] = [{ v: "todas", label: "Todas" }, { v: "nova", label: "Novas" }, { v: "escolhida", label: "Escolhidas" }, { v: "feita", label: "Feitas" }];
const NEXT: Record<IdeaStatus, IdeaStatus> = { nova: "escolhida", escolhida: "feita", feita: "nova" };

export default function IdeaBank() {
  const [list, setList] = useStored<IdeaItem[]>("banco-de-ideias", []);
  const [panel, setPanel] = useStored<Video[]>("painel-videos", []);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [st, setSt] = useState<IdeaStatus | "todas">("todas");
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  useEffect(() => setDate(iso(new Date())), []);

  const shown = filterIdeas(list, q, tag, st);
  const tags = allTags(list);

  function add() {
    const { text, tags: tg } = parseIdeaInput(draft);
    if (!text) return;
    setList([{ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text, tags: tg, status: "nova", created: iso(new Date()) }, ...list]);
    setDraft("");
  }
  const upd = (id: string, patch: Partial<IdeaItem>) => setList(list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const del = (id: string) => setList(list.filter((i) => i.id !== id));
  function toPanel(i: IdeaItem) {
    // evita o cartão duplicado: se a ideia já virou um vídeo que ainda está no painel, não cria outro
    if (i.videoId && panel.some((v) => v.id === i.videoId)) { setMsg("Esta ideia já está no Painel do vídeo."); return; }
    const v = { ...newVideo(i.text, iso(new Date())), notes: { ideia: i.text } };
    setPanel([v, ...panel]);
    upd(i.id, { status: "escolhida", videoId: v.id });
    setMsg("Criado no Painel do vídeo.");
  }
  function toCal(i: IdeaItem) {
    setMsg(addToCalendar(date, i.text) ? `Colocado no calendário em ${date.split("-").reverse().join("/")}.` : "Não consegui salvar no calendário neste navegador.");
  }
  function draw() {
    const pool = list.filter((i) => i.status === "nova");
    if (!pool.length) { setMsg("Não há ideias novas para sortear."); return; }
    const x = pool[Math.floor(Math.random() * pool.length)];
    setPick(x.id); setSt("todas"); setQ(""); setTag(""); setMsg("Esta é a ideia sorteada.");
  }
  const text = list.map((i) => `- ${i.text}${i.tags.length ? " " + i.tags.map((t) => "#" + t).join(" ") : ""} [${i.status}]`).join("\n");

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="ib-n">Anote uma ideia</label>
        <div className="addrow">
          <input id="ib-n" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="Escreva e aperte Enter. Use #etiqueta para separar" maxLength={200} />
          <button className="btn go" type="button" onClick={add} disabled={!draft.trim()}>Guardar</button>
        </div>
      </div>

      {list.length > 0 && (
        <>
          <div className="field">
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nas ideias" aria-label="Buscar nas ideias" />
            <div className="aux">
              {STATUS.map((s) => <button key={s.v} type="button" className={`chip${st === s.v ? " on" : ""}`} aria-pressed={st === s.v} onClick={() => setSt(s.v)}>{s.label}</button>)}
              {tags.map((t) => <button key={t} type="button" className={`chip${tag === t ? " on" : ""}`} aria-pressed={tag === t} onClick={() => setTag(tag === t ? "" : t)}>#{t}</button>)}
            </div>
          </div>
          <div className="rrow" style={{ marginBottom: 12 }}>
            <button className="btn ghost" type="button" onClick={draw}>Sortear uma ideia nova</button>
            <label className="inline">Data para o calendário <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "auto", marginLeft: 8 }} /></label>
          </div>
        </>
      )}

      {msg && <p className="status" role="status">{msg}</p>}
      {list.length === 0 && <p className="note">Aqui ficam todas as ideias que surgem fora de hora: no ônibus, no banho, no meio de um vídeo. Anote agora e escolha depois. Dica: use #etiquetas, como #tutorial ou #série.</p>}

      <ul className="ibank">
        {shown.map((i) => (
          <li key={i.id} className={pick === i.id ? "pick" : ""}>
            <div className="ib-top">
              <button type="button" className={`ib-st st-${i.status}`} onClick={() => upd(i.id, { status: NEXT[i.status] })} aria-label={`Estado: ${i.status}. Tocar para mudar`}>{i.status}</button>
              <span className="ib-text">{i.text}</span>
            </div>
            {i.tags.length > 0 && <span className="count">{i.tags.map((t) => "#" + t).join(" ")}</span>}
            <div className="ib-act">
              <button className="link" type="button" onClick={() => toPanel(i)}>{i.videoId && panel.some((v) => v.id === i.videoId) ? "Já está no painel" : "Criar no painel"}</button>
              <button className="link" type="button" onClick={() => toCal(i)}>Pôr no calendário</button>
              <button className="link" type="button" onClick={() => del(i.id)}>Apagar</button>
            </div>
          </li>
        ))}
      </ul>
      {list.length > 0 && !shown.length && <p className="note">Nenhuma ideia com esse filtro.</p>}

      {list.length > 0 && (
        <div className="rrow">
          <CopyButton text={text} label="Copiar todas" />
          <button className="btn ghost" type="button" onClick={() => downloadText(text, "ideias.txt")}>Baixar .txt</button>
        </div>
      )}
      <p className="note">Fica salvo só neste aparelho e neste navegador. Toque no estado (nova, escolhida, feita) para mudar.</p>
    </div>
  );
}
