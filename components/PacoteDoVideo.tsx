"use client";
import { useMemo, useState } from "react";
import { makeZip } from "@/lib/zipStore";
import { buildPackage, type Cue } from "@/lib/pacote";
import { fmtTime } from "@/lib/toolkit";
import { CopyButton, downloadBlob, downloadText } from "@/components/tools/ui";
import PacotePublicacao from "@/components/PacotePublicacao";

// Aparece abaixo do player depois que o áudio fica pronto. Só lê o que o áudio já mediu; não mexe no áudio.
type Audio = { blob: Blob; name: string; warn: string } | null;
export default function PacoteDoVideo({ cues, raw, speed, getAudio }: { cues: Cue[]; raw: string; speed: number; getAudio?: (originalSpeed: boolean) => Promise<Audio> }) {
  const [original, setOriginal] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipMsg, setZipMsg] = useState("");
  const factor = original ? 1 : speed;
  const p = useMemo(() => buildPackage(cues, raw, factor), [cues, raw, factor]);
  const velo = factor === 1 ? "velocidade normal" : `velocidade ${String(factor).replace(".", ",")}×`;
  const temCap = p.chapters.marks > 0;
  const chaptersOk = temCap && p.chapters.output && p.chapters.problems.length === 0;

  // Zip com o áudio, a legenda e os capítulos, todos com os mesmos tempos
  async function zip() {
    if (!getAudio || zipBusy) return;
    setZipBusy(true); setZipMsg("Montando o zip…");
    try {
      const a = await getAudio(original);
      if (!a) { setZipMsg("Não foi possível montar o áudio."); return; }
      const files: { name: string; data: Blob | Uint8Array }[] = [
        { name: a.name, data: a.blob },
        { name: "legenda-sauim.srt", data: new TextEncoder().encode("\ufeff" + p.srt) },
      ];
      if (chaptersOk) files.push({ name: "capitulos-youtube.txt", data: new TextEncoder().encode("\ufeff" + p.chapters.output.replace(/\n/g, "\r\n") + "\r\n") });
      downloadBlob(await makeZip(files), "pacote-do-video-sauim.zip");
      setZipMsg((a.warn.trim() || "Zip baixado.") + (temCap && !chaptersOk ? " Os capítulos ficaram de fora porque têm problemas (veja acima)." : ""));
    } catch (e) {
      console.error(e);
      setZipMsg("Não foi possível montar o zip. Baixe os arquivos um a um.");
    } finally {
      setZipBusy(false);
    }
  }

  return (
    <div className="pacote" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
      <h3 style={{ margin: "0 0 4px" }}>Pacote do vídeo</h3>
      <p className="note" style={{ marginTop: 0 }}>
        Legenda e capítulos com os tempos reais deste áudio, ajustados pelos silêncios da fala, sem você digitar nada. Os tempos valem para o áudio baixado na {velo}.
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
      {getAudio && (
        <div className="rrow" style={{ marginTop: 12 }}>
          <button className="btn go" type="button" onClick={zip} disabled={zipBusy}>{zipBusy ? "Montando…" : "Baixar tudo em um zip"}</button>
          <span className="count" role="status" aria-live="polite">{zipMsg || `Áudio, legenda${chaptersOk ? " e capítulos" : ""} com os mesmos tempos.`}</span>
        </div>
      )}

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

      <PacotePublicacao raw={raw} chapters={p.chapters.problems.length ? "" : p.chapters.output} chaptersBlocked={temCap && p.chapters.problems.length > 0} />

      <p className="note" style={{ marginTop: 16 }}>
        Confira no vídeo antes de publicar: em trechos com várias frases, a legenda pode sair adiantada ou atrasada por frações de segundo. No YouTube Studio, procure a opção de legendas e carregue o arquivo .srt (com tempo).
      </p>
    </div>
  );
}
