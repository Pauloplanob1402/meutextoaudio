"use client";
import { useMemo, useState } from "react";
import { buildPackage, type Cue } from "@/lib/pacote";
import { fmtTime } from "@/lib/toolkit";
import { CopyButton, downloadText } from "@/components/tools/ui";

// Aparece abaixo do player depois que o áudio fica pronto. Só lê o que o áudio já mediu; não mexe no áudio.
export default function PacoteDoVideo({ cues, raw, speed }: { cues: Cue[]; raw: string; speed: number }) {
  const [original, setOriginal] = useState(false);
  const factor = original ? 1 : speed;
  const p = useMemo(() => buildPackage(cues, raw, factor), [cues, raw, factor]);
  const velo = factor === 1 ? "velocidade normal" : `velocidade ${String(factor).replace(".", ",")}×`;
  const temCap = p.chapters.marks > 0;

  return (
    <div className="pacote" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
      <h3 style={{ margin: "0 0 4px" }}>Pacote do vídeo</h3>
      <p className="note" style={{ marginTop: 0 }}>
        Legenda e capítulos com os tempos reais deste áudio, sem você digitar nada. Os tempos valem para o áudio baixado na {velo}.
      </p>
      {speed !== 1 && (
        <label className="note" style={{ display: "block", margin: "8px 0" }}>
          <input type="checkbox" checked={original} onChange={(e) => setOriginal(e.target.checked)} /> Usar os tempos do áudio na velocidade original
        </label>
      )}

      <p className="count" style={{ marginTop: 12 }}>
        <b>Legenda (.srt)</b>: {p.count} {p.count === 1 ? "trecho" : "trechos"}, até {fmtTime(p.total)}.
      </p>
      <div className="out" style={{ marginTop: 8 }}>{p.preview}</div>
      <div className="rrow" style={{ marginTop: 12 }}>
        <button className="btn ghost" type="button" onClick={() => downloadText(p.srt, "legenda-sauim.srt", "application/x-subrip")}>Baixar legenda (.srt)</button>
        <CopyButton text={p.srt} label="Copiar legenda" />
      </div>

      <p className="count" style={{ marginTop: 20 }}><b>Capítulos para o YouTube</b></p>
      {temCap ? (
        <>
          {p.chapters.problems.length > 0 && (
            <ul className="problems" aria-live="polite">{p.chapters.problems.map((x, i) => <li key={i}>{x}</li>)}</ul>
          )}
          {p.chapters.output && (
            <>
              <div className="out" style={{ marginTop: 8 }}>{p.chapters.output}</div>
              <div className="rrow" style={{ marginTop: 12 }}><CopyButton text={p.chapters.output} label="Copiar capítulos" /></div>
            </>
          )}
        </>
      ) : (
        <p className="note" style={{ marginTop: 4 }}>
          Quer capítulos prontos? No roteiro, escreva em uma linha sozinha <b>[CAPÍTULO: Título]</b> antes de cada parte. A marca não é lida em voz alta. Exemplo: <b>[CAPÍTULO: Introdução]</b>.
        </p>
      )}

      <p className="note" style={{ marginTop: 16 }}>
        Confira no vídeo antes de publicar: em trechos com várias frases, a legenda pode sair adiantada ou atrasada por frações de segundo. No YouTube Studio, procure a opção de legendas e carregue o arquivo .srt (com tempo).
      </p>
    </div>
  );
}
