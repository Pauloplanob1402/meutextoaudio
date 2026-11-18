"use client";
import { useEffect, useState } from "react";
import { cutTitle, TITLE_LIMITS, titleFit } from "@/lib/toolkit2";
import { useStored } from "./ui";

export default function CtrSimulator() {
  const [src, setSrc] = useState<string | null>(null);
  const [titles, setTitles] = useStored<string[]>("ctr-titulos", ["", "", ""]);
  const [channel, setChannel] = useStored<string>("ctr-canal", "Seu canal");
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState<"desktop" | "celular">("desktop");
  const [msg, setMsg] = useState("");

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setMsg("Escolha um arquivo de imagem (JPG ou PNG)."); return; }
    setMsg("");
    setSrc(URL.createObjectURL(f));
  }
  const safe = [0, 1, 2].map((i) => titles[i] ?? "");
  const setTitle = (i: number, v: string) => setTitles(safe.map((t, j) => (j === i ? v : t)));
  const shown = safe.map((t, i) => t.trim() || `Título de exemplo ${i + 1}`);
  const max = mode === "desktop" ? TITLE_LIMITS.desktop : TITLE_LIMITS.mobile;

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="mini">Sua miniatura</label>
        <input id="mini" type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} />
        <span className="count">A imagem não sai do seu aparelho.</span>
        {msg && <p className="note">{msg}</p>}
      </div>
      <div className="field">
        <label htmlFor="canal">Nome do canal</label>
        <input id="canal" type="text" value={channel} onChange={(e) => setChannel(e.target.value)} maxLength={40} />
      </div>
      {[0, 1, 2].map((i) => {
        const f = titleFit(safe[i]);
        const cls = f.tooLong ? "bad" : (mode === "desktop" ? f.desktopCut : f.mobileCut) ? "warn" : "ok";
        return (
          <div className="field" key={i}>
            <label htmlFor={`t${i}`}>Título {i + 1}</label>
            <input id={`t${i}`} type="text" value={safe[i]} onChange={(e) => setTitle(i, e.target.value)} placeholder="Digite uma opção de título" />
            <span className="count"><b className={cls}>{f.len}</b> caracteres{f.tooLong ? " · passa do limite de 100 do YouTube" : mode === "desktop" ? (f.desktopCut ? " · deve ser cortado no computador" : " · cabe inteiro no computador") : (f.mobileCut ? " · deve ser cortado no celular" : " · cabe inteiro no celular")}</span>
          </div>
        );
      })}

      <div className="rrow">
        <div className="speeds" role="group" aria-label="Aparelho">
          {(["desktop", "celular"] as const).map((m) => (
            <button key={m} type="button" className={mode === m ? "on" : ""} onClick={() => setMode(m)}>{m === "desktop" ? "Computador" : "Celular"}</button>
          ))}
        </div>
        <div className="speeds" role="group" aria-label="Tema">
          {[false, true].map((d) => (
            <button key={String(d)} type="button" className={dark === d ? "on" : ""} onClick={() => setDark(d)}>{d ? "Tema escuro" : "Tema claro"}</button>
          ))}
        </div>
      </div>

      <div className={`ytmock ${dark ? "dk" : ""} ${mode}`}>
        {shown.map((t, i) => (
          <div className="ytc" key={i}>
            <div className="ytc-thumb" style={src ? { backgroundImage: `url(${src})` } : undefined}>
              {!src && <span>Sua miniatura</span>}
              <em>10:24</em>
            </div>
            <div className="ytc-row">
              <div className="ytc-av" aria-hidden="true">{(channel.trim()[0] || "C").toUpperCase()}</div>
              <div className="ytc-info">
                <div className="ytc-title">{cutTitle(t, max)}</div>
                <div className="ytc-meta">{channel.trim() || "Seu canal"}<br />12 mil visualizações · há 2 dias</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="field" style={{ marginTop: 20 }}>
        <span>Teste do tamanho pequeno</span>
        <p className="count">É assim que a miniatura aparece nos vídeos sugeridos, bem menor. Dá para ler o texto?</p>
        <div className={`ytmock ${dark ? "dk" : ""} small`}>
          <div className="ytc small">
            <div className="ytc-thumb" style={src ? { backgroundImage: `url(${src})` } : undefined}>{!src && <span>Miniatura</span>}</div>
            <div className="ytc-info"><div className="ytc-title">{cutTitle(shown[0], 40)}</div><div className="ytc-meta">{channel.trim() || "Seu canal"}</div></div>
          </div>
        </div>
      </div>
      <p className="note">É uma simulação aproximada: o YouTube muda o visual de vez em quando e corta o título conforme a largura da tela. Use para comparar opções e conferir se o texto da miniatura continua legível no celular.</p>
    </div>
  );
}
