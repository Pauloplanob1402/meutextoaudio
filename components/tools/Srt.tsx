"use client";
import { useMemo, useState } from "react";
import { buildSrt, parseDuration, fmtTime } from "@/lib/toolkit";
import { CopyButton, downloadText } from "./ui";

export default function Srt() {
  const [raw, setRaw] = useState("");
  const [dur, setDur] = useState("");
  const total = parseDuration(dur) ?? undefined;
  const r = useMemo(() => buildSrt(raw, total), [raw, total]);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="s">Seu texto</label>
        <textarea id="s" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={"Cole o texto da narração.\n\nOu escreva com horários, um por linha:\n0:00 Olá, pessoal\n0:04 Hoje vamos falar de áudio"} />
      </div>
      <div className="field">
        <label htmlFor="d">Duração real do áudio (opcional)</label>
        <input id="d" type="text" inputMode="numeric" value={dur} onChange={(e) => setDur(e.target.value)} placeholder="Ex.: 3:20" />
        <span className="count">Sem horários no texto, a legenda é distribuída por essa duração. Se deixar em branco, usamos uma estimativa.</span>
      </div>

      {r.count > 0 && (
        <div className="result" aria-live="polite">
          <p className="count">
            {r.mode === "tempos" ? "Usei os horários que você escreveu." : `Distribuí o texto em ${fmtTime(r.total)}.`} {r.count} {r.count === 1 ? "trecho" : "trechos"}.
          </p>
          <div className="out" style={{ marginTop: 12 }}>{r.srt}</div>
          <div className="rrow" style={{ marginTop: 12 }}>
            <button className="btn" type="button" onClick={() => downloadText(r.srt, "legenda.srt", "application/x-subrip")}>Baixar .srt</button>
            <CopyButton text={r.srt} />
          </div>
        </div>
      )}
      <p className="note">Sem horários escritos, os tempos são calculados e podem sair um pouco fora do lugar. Informe a duração real do áudio para ficar mais certo e confira no vídeo antes de publicar.</p>
    </div>
  );
}
