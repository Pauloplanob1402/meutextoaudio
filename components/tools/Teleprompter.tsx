"use client";
import { useEffect, useRef, useState } from "react";
import { BLOCK_IDS } from "@/lib/playbooks";
import { useStored } from "./ui";

export default function Teleprompter() {
  const [text, setText] = useStored<string>("teleprompter-texto", "");
  const [speed, setSpeed] = useStored<number>("teleprompter-vel", 40);
  const [size, setSize] = useStored<number>("teleprompter-fonte", 44);
  const [mirror, setMirror] = useStored<boolean>("teleprompter-espelho", false);
  const [blocks] = useStored<Record<string, string>>("roteiro-blocos", {});
  const [run, setRun] = useState(false);
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spd = useRef(speed);
  spd.current = speed;

  const hasBlocks = BLOCK_IDS.some((b) => (blocks[b] ?? "").trim());
  const fromBlocks = () => setText(BLOCK_IDS.map((b) => (blocks[b] ?? "").trim()).filter(Boolean).join("\n\n"));

  // rolagem suave: usa o tempo real entre os quadros, então a velocidade é a mesma em qualquer tela
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now(), acc = 0;
    const tick = (now: number) => {
      const el = box.current;
      if (!el) return;
      acc += (spd.current * (now - last)) / 1000;
      last = now;
      if (acc >= 1) { const px = Math.floor(acc); el.scrollTop += px; acc -= px; }
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) { setPlaying(false); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => { if (count === 1) setPlaying(true); setCount(count - 1); }, 1000);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setCount(0); setPlaying((p) => !p); }
      if (e.key === "ArrowUp") setSpeed(Math.min(150, speed + 5));
      if (e.key === "ArrowDown") setSpeed(Math.max(5, speed - 5));
      if (e.key === "Escape") { setPlaying(false); setRun(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function start() { setRun(true); setPlaying(false); requestAnimationFrame(() => { if (box.current) box.current.scrollTop = 0; setCount(3); }); }
  const full = () => { const el = stage.current; if (!el) return; if (document.fullscreenElement) document.exitFullscreen?.(); else el.requestFullscreen?.(); };

  if (!run) {
    return (
      <div className="tool">
        <div className="field">
          <label htmlFor="tp">Seu roteiro</label>
          <textarea id="tp" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole aqui o texto que você vai ler gravando." />
          <div className="aux">
            {hasBlocks && <button className="chip" type="button" onClick={fromBlocks}>Trazer do Roteiro em blocos</button>}
            {text && <button className="chip" type="button" onClick={() => setText("")}>Limpar</button>}
          </div>
        </div>
        <div className="triple p3 rv">
          <div className="field"><label htmlFor="sp">Velocidade: <b>{speed}</b></label><input id="sp" type="range" min={5} max={150} step={5} value={speed} onChange={(e) => setSpeed(+e.target.value)} /></div>
          <div className="field"><label htmlFor="sz">Tamanho da letra: <b>{size}</b></label><input id="sz" type="range" min={24} max={96} step={4} value={size} onChange={(e) => setSize(+e.target.value)} /></div>
        </div>
        <label className="inline"><input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> Espelhar o texto (para usar com vidro de teleprompter)</label>
        <div className="rrow" style={{ marginTop: 12 }}>
          <button className="btn go" type="button" onClick={start} disabled={!text.trim()}>Começar a ler</button>
        </div>
        <p className="note">Durante a leitura: Espaço pausa e continua, setas para cima e para baixo mudam a velocidade, Esc volta para cá. No celular, use os botões. Dica: ajuste a velocidade ao seu ritmo de fala testando um trecho curto.</p>
      </div>
    );
  }

  return (
    <div className="tool">
      <div className="tpstage" ref={stage}>
        <div className="tpbar">
          <button className="btn go" type="button" onClick={() => { setCount(0); setPlaying(!playing); }}>{playing ? "Pausar" : "Continuar"}</button>
          <button className="btn ghost" type="button" onClick={() => setSpeed(Math.max(5, speed - 5))} aria-label="Mais devagar">−</button>
          <span className="count" style={{ color: "#fff" }}>Velocidade {speed}</span>
          <button className="btn ghost" type="button" onClick={() => setSpeed(Math.min(150, speed + 5))} aria-label="Mais rápido">+</button>
          <button className="btn ghost" type="button" onClick={() => setSize(Math.max(24, size - 4))} aria-label="Letra menor">A−</button>
          <button className="btn ghost" type="button" onClick={() => setSize(Math.min(96, size + 4))} aria-label="Letra maior">A+</button>
          <button className="btn ghost" type="button" onClick={() => { if (box.current) box.current.scrollTop = 0; }}>Voltar ao início</button>
          <button className="btn ghost" type="button" onClick={full}>Tela cheia</button>
          <button className="btn ghost" type="button" onClick={() => { setPlaying(false); setCount(0); setRun(false); }}>Sair</button>
        </div>
        <div className="tpbox" ref={box}>
          <div className="tpline" aria-hidden="true" />
          <div className="tptext" style={{ fontSize: size, transform: mirror ? "scaleX(-1)" : undefined }}>{text}</div>
        </div>
        {count > 0 && <div className="tpcount" aria-live="assertive">{count}</div>}
      </div>
    </div>
  );
}
