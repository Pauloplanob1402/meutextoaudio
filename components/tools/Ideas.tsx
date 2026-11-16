"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NICHES } from "@/lib/ideas";
import { ymd } from "@/lib/toolkit";
import { CopyButton, addToCalendar } from "./ui";

export default function Ideas() {
  const [niche, setNiche] = useState(NICHES[0]);
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState("");

  // por padrão, o dia seguinte (a data só existe no navegador)
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDate(ymd(d));
  }, []);

  function add(title: string) {
    if (!date) return;
    const [y, m, d] = date.split("-").map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
    setMsg(addToCalendar(date, title) ? `Adicionado ao dia ${label}.` : "Não consegui salvar no calendário neste navegador.");
  }

  return (
    <div className="tool">
      <div className="field">
        <span>Escolha um assunto</span>
        <div className="speeds" role="group" aria-label="Assunto">
          {NICHES.map((n) => (
            <button key={n.id} type="button" className={niche.id === n.id ? "on" : ""} onClick={() => { setNiche(n); setMsg(""); }}>{n.name}</button>
          ))}
        </div>
      </div>

      {niche.note && <p className="note nichenote">{niche.note}</p>}

      <div className="field">
        <label htmlFor="dia">Ao adicionar ao calendário, usar o dia</label>
        <input id="dia" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <p className="count" aria-live="polite" style={{ minHeight: 24 }}>
        {msg && <>{msg} <Link href="/ferramentas/calendario">Ver no calendário</Link></>}
      </p>

      <ul className="ideas">
        {niche.ideas.map((i) => (
          <li key={i.title}>
            <span className="badge">{i.format}</span>
            <h3>{i.title}</h3>
            <p><b>Como começar:</b> {i.hook}</p>
            <div className="rrow">
              <CopyButton text={i.title} label="Copiar título" />
              <button className="btn ghost" type="button" onClick={() => add(i.title)} disabled={!date}>Adicionar ao calendário</button>
            </div>
          </li>
        ))}
      </ul>
      <p className="note">São ideias de formato que costumam funcionar, escritas para servir de ponto de partida. Não são um ranking do que está em alta hoje. Troque o que está entre [colchetes] pelo seu assunto.</p>
    </div>
  );
}
