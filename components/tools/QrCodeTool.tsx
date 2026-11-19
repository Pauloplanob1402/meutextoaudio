"use client";
import { useEffect, useRef, useState } from "react";
import { qrContrast, withSubscribe } from "@/lib/sistema3";
import { downloadBlob, downloadText, useStored } from "./ui";

type Lvl = "L" | "M" | "Q" | "H";

export default function QrCodeTool() {
  const [url, setUrl] = useStored<string>("qr-endereco", "");
  const [sub, setSub] = useStored<boolean>("qr-inscricao", true);
  const [fg, setFg] = useStored<string>("qr-frente", "#12122B");
  const [bg, setBg] = useStored<string>("qr-fundo", "#FFFFFF");
  const [lvl, setLvl] = useStored<Lvl>("qr-nivel", "M");
  const [size, setSize] = useStored<number>("qr-tamanho", 512);
  const [err, setErr] = useState("");
  const cv = useRef<HTMLCanvasElement>(null);
  const data = withSubscribe(url, sub);
  const c = qrContrast(fg, bg);
  const isYt = /youtube\.com|youtu\.be/i.test(url);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas || !data) { setErr(""); return; }
    let live = true;
    import("qrcode").then((Q) => Q.toCanvas(canvas, data, { width: 280, margin: 2, errorCorrectionLevel: lvl, color: { dark: fg, light: bg } }))
      .then(() => live && setErr(""))
      .catch(() => live && setErr("Este texto é longo demais para um QR code. Use um endereço mais curto."));
    return () => { live = false; };
  }, [data, fg, bg, lvl]);

  async function png() {
    const Q = await import("qrcode");
    const url2 = await Q.toDataURL(data, { width: size, margin: 2, errorCorrectionLevel: lvl, color: { dark: fg, light: bg } });
    const blob = await (await fetch(url2)).blob();
    downloadBlob(blob, "qrcode.png");
  }
  async function svg() {
    const Q = await import("qrcode");
    downloadText(await Q.toString(data, { type: "svg", margin: 2, errorCorrectionLevel: lvl, color: { dark: fg, light: bg } }), "qrcode.svg", "image/svg+xml");
  }

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="qr-u">Endereço ou texto</label>
        <input id="qr-u" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/@seucanal" />
      </div>
      {isYt && <label className="inline"><input type="checkbox" checked={sub} onChange={(e) => setSub(e.target.checked)} /> Abrir já pedindo a inscrição no canal</label>}

      <div className="triple p3 rv" style={{ marginTop: 12 }}>
        <div className="field"><label htmlFor="qr-f">Cor do código</label><input id="qr-f" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="qrcolor" /></div>
        <div className="field"><label htmlFor="qr-b">Cor do fundo</label><input id="qr-b" type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="qrcolor" /></div>
        <div className="field">
          <label htmlFor="qr-l">Resistência a falhas</label>
          <select id="qr-l" value={lvl} onChange={(e) => setLvl(e.target.value as Lvl)}>
            <option value="L">Baixa (código mais simples)</option><option value="M">Média (recomendado)</option><option value="Q">Alta</option><option value="H">Máxima (código mais denso)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="qr-s">Tamanho do PNG: <b>{size}</b> px</label>
          <input id="qr-s" type="range" min={256} max={2048} step={128} value={size} onChange={(e) => setSize(+e.target.value)} />
        </div>
      </div>
      {(c.ratio < 4 || c.inverted) && <p className="note"><b className="warn">Atenção:</b> {c.inverted ? "o código está mais claro que o fundo, e alguns leitores não leem assim. " : ""}{c.ratio < 4 ? "O contraste está baixo e o código pode não abrir no celular. " : ""}Prefira o código escuro sobre fundo claro.</p>}

      {data ? (
        <div className="qrbox"><canvas ref={cv} aria-label="QR code" />{err && <p className="note">{err}</p>}</div>
      ) : <p className="note">Escreva o endereço do seu canal ou de um vídeo para gerar o QR code.</p>}

      <div className="rrow">
        <button className="btn go" type="button" onClick={png} disabled={!data || !!err}>Baixar PNG</button>
        <button className="btn ghost" type="button" onClick={svg} disabled={!data || !!err}>Baixar SVG</button>
      </div>
      <p className="note">O QR code é gerado no seu aparelho e não vence: vale para sempre, enquanto o endereço existir. Teste com o seu celular antes de imprimir. O SVG serve para impressão em qualquer tamanho sem perder qualidade.</p>
    </div>
  );
}
