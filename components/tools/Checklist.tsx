"use client";
import { useStored } from "./ui";

const ITEMS = [
  "O título é claro e as palavras mais importantes estão no começo",
  "A miniatura é legível no celular",
  "O começo do vídeo já mostra o que a pessoa vai ver",
  "A descrição tem um resumo nas primeiras linhas",
  "Os capítulos estão na descrição",
  "As hashtags e as tags foram adicionadas",
  "As legendas foram enviadas",
  "O volume e a qualidade do áudio foram conferidos",
  "O vídeo foi assistido do começo ao fim, sem erros",
  "O público (se é feito para crianças ou não) está marcado",
  "A data e a hora de publicação foram escolhidas",
  "Há um convite para a pessoa continuar assistindo (próximo vídeo ou playlist)",
];

export default function Checklist() {
  const [done, setDone] = useStored<number[]>("checklist-publicacao", []);
  const toggle = (i: number) => setDone(done.includes(i) ? done.filter((x) => x !== i) : [...done, i]);
  const pct = Math.round((done.length / ITEMS.length) * 100);

  return (
    <div className="tool">
      <p className="count" aria-live="polite"><b className={done.length === ITEMS.length ? "ok" : ""}>{done.length}</b> de {ITEMS.length} itens conferidos</p>
      <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
      <ul className="checks">
        {ITEMS.map((t, i) => (
          <li key={i}>
            <label>
              <input type="checkbox" checked={done.includes(i)} onChange={() => toggle(i)} />
              <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="rrow">
        <button className="btn ghost" type="button" onClick={() => setDone([])} disabled={!done.length}>Começar um novo vídeo</button>
      </div>
    </div>
  );
}
