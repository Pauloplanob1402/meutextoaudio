"use client";
import { useEffect, useState } from "react";
import { newVideo, planSeries, seriesName, seriesText, type Video } from "@/lib/sistema";
import { CopyButton, addToCalendar, downloadText, useStored } from "./ui";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const FREQ = [
  { v: 1 as const, label: "1 por semana" },
  { v: 2 as const, label: "2 por semana" },
  { v: 3 as const, label: "3 por semana" },
  { v: 7 as const, label: "1 por dia" },
];

export default function SeriesPlanner() {
  const [theme, setTheme] = useStored<string>("serie-tema", "");
  const [count, setCount] = useStored<number>("serie-qtd", 6);
  const [freq, setFreq] = useStored<1 | 2 | 3 | 7>("serie-freq", 1);
  const [start, setStart] = useState("");
  const [msg, setMsg] = useState("");
  const [panel, setPanel] = useStored<Video[]>("painel-videos", []);
  useEffect(() => setStart(iso(new Date())), []);

  const eps = planSeries({ theme, count, startDate: start, perWeek: freq });
  const text = eps.length ? seriesText(theme, eps) : "";
  const br = (d: string) => (d ? d.split("-").reverse().join("/") : "");

  function toCalendar() {
    const ok = eps.filter((e) => e.date).every((e) => addToCalendar(e.date, `Série: ${e.title}`));
    setMsg(ok ? `${eps.length} episódios colocados no calendário de conteúdo.` : "Não foi possível salvar no calendário neste navegador.");
  }
  function toPanel() {
    const created = iso(new Date());
    const vids = eps.map((e) => ({ ...newVideo(e.title, created), date: e.date || undefined, notes: { ideia: `${e.role}. ${e.goal}`, gancho: e.hook } }));
    setPanel([...vids, ...panel]);
    setMsg(`${eps.length} vídeos criados no Painel do vídeo, já com data e gancho sugerido.`);
  }

  return (
    <div className="tool">
      <div className="triple p3 rv">
        <div className="field">
          <label htmlFor="st">Tema da série</label>
          <input id="st" type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex.: edição de vídeo no celular" maxLength={80} />
          <span className="count">Use um assunto, não uma frase inteira.</span>
        </div>
        <div className="field">
          <label htmlFor="sd">Data do primeiro episódio</label>
          <input id="sd" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sc">Quantidade de episódios: <b>{count}</b></label>
          <input id="sc" type="range" min={3} max={12} value={count} onChange={(e) => setCount(parseInt(e.target.value, 10))} />
        </div>
        <div className="field">
          <span>Frequência</span>
          <div className="speeds" role="group" aria-label="Frequência">
            {FREQ.map((f) => <button key={f.v} type="button" className={freq === f.v ? "on" : ""} onClick={() => setFreq(f.v)}>{f.label}</button>)}
          </div>
        </div>
      </div>

      {!eps.length && <p className="note">Escreva o tema para ver a grade da série. Uma série bem montada faz a pessoa assistir um vídeo atrás do outro e segura a audiência.</p>}

      {eps.length > 0 && (
        <>
          <p className="nichenote"><b>Nome sugerido para a playlist:</b> {seriesName(theme)}</p>
          <ol className="blocks eps">
            {eps.map((e) => (
              <li key={e.n}>
                <div className="blockhead">
                  <h3>{e.n}. {e.title}</h3>
                  <span className="badge">{e.role}</span>
                  {e.date && <span className="count">{br(e.date)}</span>}
                </div>
                <p><b>Objetivo:</b> {e.goal}</p>
                <p><b>Gancho:</b> {e.hook}</p>
                <p><b>Final:</b> {e.cta}</p>
              </li>
            ))}
          </ol>
          <div className="rrow">
            <button className="btn go" type="button" onClick={toPanel}>Criar no Painel do vídeo</button>
            <button className="btn ghost" type="button" onClick={toCalendar}>Colocar no calendário</button>
            <CopyButton text={text} label="Copiar plano" />
            <button className="btn ghost" type="button" onClick={() => downloadText(text, "serie.txt")}>Baixar .txt</button>
          </div>
        </>
      )}
      {msg && <p className="status" role="status">{msg}</p>}
      <p className="note">Os títulos são modelos: ajuste as palavras para o seu jeito de falar. Quanto mais específico o tema, melhores saem os títulos. Fica salvo só neste aparelho.</p>
    </div>
  );
}
