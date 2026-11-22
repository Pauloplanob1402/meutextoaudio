"use client";
import { useMemo } from "react";
import { buildTimeLinks, clock, parseClock, parseYoutubeId, timeLink } from "@/lib/sistema3";
import { CopyButton, useStored } from "./ui";

export default function TimeLinks() {
  const [url, setUrl] = useStored<string>("links-tempo-url", "");
  const [raw, setRaw] = useStored<string>("links-tempo-linhas", "");
  const [one, setOne] = useStored<string>("links-tempo-um", "");
  const id = useMemo(() => parseYoutubeId(url), [url]);
  const r = useMemo(() => (id ? buildTimeLinks(id, raw) : { rows: [], bad: [] }), [id, raw]);
  const oneSec = parseClock(one);
  const text = r.rows.map((x) => `${clock(x.sec)}${x.label ? " " + x.label : ""} - ${x.link}`).join("\n");
  const chap = r.rows.map((x) => `${clock(x.sec)}${x.label ? " " + x.label : ""}`).join("\n");

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="tl-u">Endereço do vídeo</label>
        <input id="tl-u" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        {url.trim() && !id && <span className="count"><b className="bad">Nenhum vídeo foi encontrado neste endereço.</b> Cole o link da barra do navegador ou do botão Compartilhar.</span>}
        {id && <span className="count"><b className="ok">Vídeo reconhecido.</b></span>}
      </div>

      <div className="field">
        <label htmlFor="tl-1">Um minuto só</label>
        <input id="tl-1" type="text" value={one} onChange={(e) => setOne(e.target.value)} placeholder="Ex.: 2:35" />
        {id && oneSec !== null && one.trim() && (
          <div className="addrow"><div className="out" style={{ flex: 1, maxHeight: "none" }}>{timeLink(id, oneSec)}</div><CopyButton text={timeLink(id, oneSec)} /></div>
        )}
      </div>

      <div className="field">
        <label htmlFor="tl-l">Vários de uma vez (um por linha)</label>
        <textarea id="tl-l" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={"0:00 Começo\n1:05 O primeiro passo\n4:30 Resultado"} />
        {r.bad.length > 0 && <ul className="problems">{r.bad.slice(0, 3).map((b) => <li key={b}>Esta linha não começa com um horário: “{b}”</li>)}</ul>}
      </div>

      {r.rows.length > 0 && (
        <>
          <div className="out">{text}</div>
          <div className="rrow">
            <CopyButton text={text} label="Copiar com links" />
            <CopyButton text={chap} label="Copiar só os capítulos" />
          </div>
        </>
      )}
      <p className="note">O link abre o vídeo no segundo escolhido. Serve para a descrição, para responder comentários (“a resposta está em 2:35”) e para mandar um trecho a alguém. Os horários no formato 0:00 dentro da descrição já viram link sozinhos no YouTube.</p>
    </div>
  );
}
