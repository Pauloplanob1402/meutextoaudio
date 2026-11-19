"use client";
import { useMemo, useState } from "react";
import { parseSubs, shiftCues, toPlain, toSrt, toVtt } from "@/lib/sistema3";
import { CopyButton, downloadText } from "./ui";

type Fmt = "srt" | "vtt" | "txt";
const NAMES: Record<Fmt, string> = { srt: ".srt", vtt: ".vtt", txt: "Texto" };

export default function SubtitleConverter() {
  const [raw, setRaw] = useState("");
  const [fmt, setFmt] = useState<Fmt>("srt");
  const [shift, setShift] = useState("0");
  const [times, setTimes] = useState(false);
  const [msg, setMsg] = useState("");

  const sec = parseFloat(shift.replace(",", ".")) || 0;
  const cues = useMemo(() => shiftCues(parseSubs(raw), sec), [raw, sec]);
  const out = !cues.length ? "" : fmt === "srt" ? toSrt(cues) : fmt === "vtt" ? toVtt(cues) : toPlain(cues, times);

  async function pick(f?: File) {
    if (!f) return;
    try { setRaw(await f.text()); setMsg(`Arquivo “${f.name}” carregado.`); } catch { setMsg("Não consegui ler este arquivo."); }
  }

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="sc-f">Envie a legenda (.srt ou .vtt)</label>
        <input id="sc-f" type="file" accept=".srt,.vtt,text/plain,text/vtt" onChange={(e) => pick(e.target.files?.[0])} />
        <label htmlFor="sc-t" style={{ marginTop: 8 }}>Ou cole o conteúdo</label>
        <textarea id="sc-t" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={"1\n00:00:01,000 --> 00:00:03,500\nOlá, pessoal"} />
        {msg && <span className="count">{msg}</span>}
      </div>

      {raw.trim() && !cues.length && <p className="note"><b className="bad">Não encontrei legendas neste texto.</b> Confira se as linhas de tempo têm o formato 00:00:01,000 --&gt; 00:00:03,500.</p>}

      {cues.length > 0 && (
        <>
          <p className="count">{cues.length} {cues.length === 1 ? "trecho encontrado" : "trechos encontrados"}.</p>
          <div className="rrow">
            <div className="speeds" role="group" aria-label="Formato de saída">
              {(Object.keys(NAMES) as Fmt[]).map((k) => <button key={k} type="button" className={fmt === k ? "on" : ""} onClick={() => setFmt(k)}>{NAMES[k]}</button>)}
            </div>
            {fmt === "txt" && <label className="inline"><input type="checkbox" checked={times} onChange={(e) => setTimes(e.target.checked)} /> Com os horários</label>}
          </div>
          <div className="field">
            <label htmlFor="sc-s">Atrasar ou adiantar tudo (segundos)</label>
            <input id="sc-s" type="text" inputMode="decimal" value={shift} onChange={(e) => setShift(e.target.value)} placeholder="Ex.: 1,5 ou -2" />
            <span className="count">Número positivo atrasa a legenda, negativo adianta.</span>
          </div>
          <div className="out">{out}</div>
          <div className="rrow">
            <button className="btn go" type="button" onClick={() => downloadText(out, `legenda.${fmt}`, fmt === "vtt" ? "text/vtt" : fmt === "srt" ? "application/x-subrip" : "text/plain")}>Baixar {fmt === "txt" ? ".txt" : "." + fmt}</button>
            <CopyButton text={out} />
          </div>
        </>
      )}
      <p className="note">Tudo acontece no seu aparelho: o arquivo não é enviado a lugar nenhum. O YouTube aceita .srt e .vtt. No texto puro, as marcações de formatação saem.</p>
    </div>
  );
}
