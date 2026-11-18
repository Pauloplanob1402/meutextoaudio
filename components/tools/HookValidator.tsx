"use client";
import { analyzeHookText, HOOK_CRITERIA, scoreHook } from "@/lib/toolkit2";
import { useStored } from "./ui";

export default function HookValidator() {
  const [checked, setChecked] = useStored<string[]>("gancho-checks", []);
  const [text, setText] = useStored<string>("gancho-texto", "");
  const r = scoreHook(checked);
  const a = analyzeHookText(text);
  const toggle = (id: string) => setChecked(checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id]);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="gancho">Escreva o começo do seu vídeo (opcional)</label>
        <textarea id="gancho" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole aqui as primeiras frases do roteiro para a ferramenta conferir o tamanho e o começo." />
        {a.words > 0 && (
          <>
            <p className="count">{a.words} palavras · cerca de {Math.round(a.seconds)} s falado · primeira frase com {a.firstWords} palavras</p>
            {a.notes.length > 0 && <ul className="problems">{a.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
          </>
        )}
      </div>

      <div className="field">
        <span>Marque o que o seu gancho já faz</span>
        <ul className="checks">
          {HOOK_CRITERIA.map((c) => (
            <li key={c.id}>
              <label>
                <input type="checkbox" checked={checked.includes(c.id)} onChange={() => toggle(c.id)} />
                <span>{c.label}<small className="sub">{c.help}</small></span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="big-out" aria-live="polite">
        <div className={`num score ${r.level}`}>{r.score}<span className="of"> / 100</span></div>
        <div className="meter" role="progressbar" aria-valuenow={r.score} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${r.score}%` }} /></div>
        <p><b>{r.label}.</b> {r.message}</p>
      </div>

      {r.missing.length > 0 && checked.length > 0 && (
        <div className="field">
          <span>O que falta (do mais importante para o menos)</span>
          <ul className="fixes">
            {r.missing.slice(0, 4).map((c) => (
              <li key={c.id}><b>+{c.weight} pontos:</b> {c.fix}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="rrow">
        <button className="btn ghost" type="button" onClick={() => setChecked([])} disabled={!checked.length}>Limpar marcações</button>
      </div>
      <p className="note">Baseado nas ideias de roteiro do livro Save the Cat! (começar com o problema e o desejo) e em boas práticas de retenção. É um guia, não uma garantia: o que vale é o teste com o público. Suas marcações ficam salvas neste aparelho.</p>
    </div>
  );
}
