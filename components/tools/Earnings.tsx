"use client";
import { useState } from "react";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Earnings() {
  const [views, setViews] = useState(50000);
  const [rpm, setRpm] = useState([2, 5, 10]);
  const labels = ["Cenário baixo", "Cenário médio", "Cenário alto"];
  const setOne = (i: number, v: number) => setRpm(rpm.map((x, j) => (j === i ? v : x)));

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="v">Visualizações por mês</label>
        <input id="v" type="number" min={0} inputMode="numeric" value={views} onChange={(e) => setViews(Math.max(0, Number(e.target.value) || 0))} />
      </div>
      <div className="field">
        <span>Valor por mil visualizações (RPM), em reais</span>
        <div className="triple">
          {rpm.map((v, i) => (
            <div key={i}>
              <label htmlFor={`r${i}`} className="count">{labels[i]}</label>
              <input id={`r${i}`} type="number" min={0} step="0.5" inputMode="decimal" value={v} onChange={(e) => setOne(i, Math.max(0, Number(e.target.value) || 0))} />
            </div>
          ))}
        </div>
        <span className="count">Os valores 2, 5 e 10 são só exemplos. Troque pelo RPM que aparece no seu YouTube Studio.</span>
      </div>
      <div className="results3" aria-live="polite">
        {rpm.map((v, i) => {
          const month = (views / 1000) * v;
          return (
            <div key={i} className="cell">
              <span className="count">{labels[i]}</span>
              <div className="num sm">{brl(month)}</div>
              <span className="count">por mês · {brl(month * 12)} por ano</span>
            </div>
          );
        })}
      </div>
      <p className="note">RPM é o quanto o criador recebe a cada mil visualizações, já descontada a parte do YouTube. Ele muda muito de assunto para assunto, de país para país e de mês para mês. Use como ordem de grandeza. Para receber, o canal precisa estar no Programa de Parcerias do YouTube: confira os requisitos atuais no próprio YouTube.</p>
    </div>
  );
}
