"use client";
import { scoreTitle, titleLabel } from "@/lib/sistema2";
import { useStored } from "./ui";

export default function TitleTester() {
  const [titles, setTitles] = useStored<string[]>("testador-titulos", ["", "", ""]);
  const [kw, setKw] = useStored<string>("testador-palavra", "");
  const safe = Array.from({ length: 5 }, (_, i) => titles[i] ?? "");
  const res = safe.map((t) => scoreTitle(t, kw));
  const filled = safe.map((t, i) => (t.trim() ? i : -1)).filter((i) => i >= 0);
  const bestScore = Math.max(0, ...filled.map((i) => res[i].score));
  const set = (i: number, v: string) => setTitles(safe.map((t, j) => (j === i ? v : t)));

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="kw">Palavra-chave do vídeo (opcional)</label>
        <input id="kw" type="text" value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Ex.: texto em áudio" maxLength={60} />
        <span className="count">A palavra que a pessoa digitaria na busca. Ela vale mais pontos no começo do título.</span>
      </div>
      {safe.map((t, i) => {
        const r = res[i];
        const show = t.trim().length > 0;
        const best = show && filled.length > 1 && r.score === bestScore;
        return (
          <div className="field tt" key={i}>
            <label htmlFor={`tt${i}`}>Título {i + 1}{best && <span className="badge" style={{ marginLeft: 8 }}>Melhor nota</span>}</label>
            <input id={`tt${i}`} type="text" value={t} onChange={(e) => set(i, e.target.value)} placeholder="Digite uma opção de título" />
            {show && (
              <>
                <div className="ttscore"><b className={`s-${titleLabel(r.score)}`}>{r.score}</b><span>{titleLabel(r.score)} · {r.len} caracteres</span></div>
                <div className="meter"><i style={{ width: `${r.score}%` }} /></div>
                <ul className="ttrules">
                  {r.rules.map((x) => <li key={x.id} className={x.ok ? "ok" : "no"}>{x.ok ? "✓" : "✗"} {x.label}{!x.ok && <small className="sub">{x.tip}</small>}</li>)}
                </ul>
              </>
            )}
          </div>
        );
      })}
      <p className="note">A nota segue regras fixas de forma (tamanho, número, palavra-chave, pontuação). Ela não avalia se o assunto interessa. Use para comparar as suas opções e depois teste no Simulador de miniatura e título. Fica salvo só neste aparelho.</p>
    </div>
  );
}
