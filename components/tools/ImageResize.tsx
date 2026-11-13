"use client";
import { useEffect, useRef, useState } from "react";
import { downloadBlob, fmtNum } from "./ui";

const PRESETS = [
  { id: "thumb", label: "Miniatura do vídeo", w: 1280, h: 720 },
  { id: "banner", label: "Banner do canal", w: 2560, h: 1440 },
  { id: "avatar", label: "Foto de perfil", w: 800, h: 800 },
  { id: "short", label: "Vertical (Shorts)", w: 1080, h: 1920 },
  { id: "square", label: "Quadrado", w: 1080, h: 1080 },
];

export default function ImageResize() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [preset, setPreset] = useState(PRESETS[0]);
  const [zoom, setZoom] = useState(1);
  const [px, setPx] = useState(50);
  const [py, setPy] = useState(50);
  const [fmt, setFmt] = useState<"png" | "jpg">("jpg");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    c.width = preset.w;
    c.height = preset.h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    if (!img) return;
    const scale = Math.max(c.width / img.width, c.height / img.height) * zoom;
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (c.width - dw) * (px / 100), (c.height - dh) * (py / 100), dw, dh);
  }, [img, preset, zoom, px, py]);

  function onFile(f?: File) {
    if (!f) return;
    const u = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => { setImg(im); setZoom(1); setPx(50); setPy(50); setMsg(""); };
    im.onerror = () => setMsg("Não consegui abrir essa imagem. Tente um arquivo JPG, PNG ou WebP.");
    im.src = u;
  }

  function save() {
    const c = cv.current;
    if (!c) return;
    const type = fmt === "png" ? "image/png" : "image/jpeg";
    c.toBlob((b) => {
      if (!b) return setMsg("Não consegui gerar o arquivo.");
      const mb = b.size / 1048576;
      setMsg(`Arquivo de ${fmtNum(Math.round(mb * 10) / 10)} MB.${preset.id === "thumb" && mb > 2 ? " Miniaturas do YouTube aceitam até 2 MB: escolha JPG." : ""}`);
      downloadBlob(b, `${preset.id}-${preset.w}x${preset.h}.${fmt}`);
    }, type, 0.92);
  }

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="f">Sua imagem</label>
        <input id="f" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <div className="field">
        <span>Tamanho</span>
        <div className="speeds" role="group" aria-label="Tamanho">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className={preset.id === p.id ? "on" : ""} onClick={() => setPreset(p)}>{p.label} ({p.w}×{p.h})</button>
          ))}
        </div>
      </div>

      <canvas ref={cv} className="preview" aria-label="Prévia da imagem" />

      {img && (
        <div className="sliders">
          <label>Aproximar<input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /></label>
          <label>Mover para os lados<input type="range" min={0} max={100} value={px} onChange={(e) => setPx(Number(e.target.value))} /></label>
          <label>Mover para cima ou para baixo<input type="range" min={0} max={100} value={py} onChange={(e) => setPy(Number(e.target.value))} /></label>
        </div>
      )}

      <div className="rrow" style={{ marginTop: 16 }}>
        <button className="btn" type="button" onClick={save} disabled={!img}>Baixar imagem</button>
        <div className="speeds" role="group" aria-label="Formato">
          {(["jpg", "png"] as const).map((f) => <button key={f} type="button" className={fmt === f ? "on" : ""} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>)}
        </div>
      </div>
      <p className="note" aria-live="polite">{msg || "A imagem é cortada para encher o tamanho escolhido. Nada é enviado para servidor nenhum."}</p>
    </div>
  );
}
