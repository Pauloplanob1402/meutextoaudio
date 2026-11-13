"use client";
import { useEffect, useRef, useState } from "react";
import { downloadBlob, fmtNum } from "./ui";

const W = 1280;
const H = 720;
const FONT = '"Bricolage Grotesque", "Arial Black", Arial, sans-serif';

const THEMES = [
  { id: "azul", name: "Azul", bg: ["#3D3DF0", "#2B2BD0"], fg: "#FFFFFF", accent: "#FFD400", accentText: "#12122B", shadow: true },
  { id: "amarelo", name: "Amarelo", bg: ["#FFD400", "#FFB800"], fg: "#12122B", accent: "#12122B", accentText: "#FFFFFF", shadow: false },
  { id: "vermelho", name: "Vermelho", bg: ["#E5322D", "#B71C18"], fg: "#FFFFFF", accent: "#FFFFFF", accentText: "#B71C18", shadow: true },
  { id: "escuro", name: "Escuro", bg: ["#12122B", "#2A2A5A"], fg: "#FFFFFF", accent: "#9C9CFF", accentText: "#12122B", shadow: true },
];

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let cur = "";
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const t = cur ? cur + " " + w : w;
      if (cur && ctx.measureText(t).width > maxW) {
        lines.push(cur);
        cur = w;
      } else cur = t;
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

export default function Thumbnail() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState("Texto em áudio em 1 minuto");
  const [tag, setTag] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [upper, setUpper] = useState(true);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fmt, setFmt] = useState<"jpg" | "png">("jpg");
  const [msg, setMsg] = useState("");
  const [fontTick, setFontTick] = useState(0);

  useEffect(() => {
    document.fonts?.load('800 100px "Bricolage Grotesque"').then(() => setFontTick((t) => t + 1)).catch(() => {});
  }, []);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;

    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, theme.bg[0]);
    g.addColorStop(1, theme.bg[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const imgX = 700;
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgX, 0, W - imgX, H);
      ctx.clip();
      const s = Math.max((W - imgX) / img.width, H / img.height);
      const dw = img.width * s;
      const dh = img.height * s;
      ctx.drawImage(img, imgX + (W - imgX - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.restore();
      ctx.fillStyle = theme.accent;
      ctx.fillRect(imgX - 12, 0, 12, H);
    }

    const left = 64;
    const maxW = (img ? imgX - 12 - 40 : W - 64) - left;
    let top = 64;
    if (tag.trim()) {
      const label = upper ? tag.trim().toUpperCase() : tag.trim();
      ctx.font = `800 40px ${FONT}`;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.roundRect(left, top, tw + 44, 68, 16);
      ctx.fill();
      ctx.fillStyle = theme.accentText;
      ctx.textBaseline = "middle";
      ctx.fillText(label, left + 22, top + 36);
      top += 68 + 28;
    }

    const text = upper ? title.toUpperCase() : title;
    const areaH = H - 64 - top;
    let size = 190;
    let lines: string[] = [];
    for (; size >= 48; size -= 4) {
      ctx.font = `800 ${size}px ${FONT}`;
      lines = wrap(ctx, text, maxW);
      const widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
      if (lines.length * size * 1.02 <= areaH && widest <= maxW) break;
    }
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textBaseline = "top";
    ctx.fillStyle = theme.fg;
    const blockH = lines.length * size * 1.02;
    let y = top + Math.max(0, (areaH - blockH) / 2);
    if (theme.shadow) { ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowOffsetY = 6; }
    for (const l of lines) { ctx.fillText(l, left, y); y += size * 1.02; }
    ctx.shadowColor = "transparent";
  }, [title, tag, theme, upper, img, fontTick]);

  function onFile(f?: File) {
    if (!f) return;
    const im = new Image();
    im.onload = () => setImg(im);
    im.onerror = () => setMsg("Não consegui abrir essa imagem. Tente um arquivo JPG, PNG ou WebP.");
    im.src = URL.createObjectURL(f);
  }

  function save() {
    cv.current?.toBlob((b) => {
      if (!b) return setMsg("Não consegui gerar o arquivo.");
      const mb = b.size / 1048576;
      setMsg(`Arquivo de ${fmtNum(Math.round(mb * 10) / 10)} MB.${mb > 2 ? " Miniaturas do YouTube aceitam até 2 MB: escolha JPG." : ""}`);
      downloadBlob(b, `miniatura.${fmt}`);
    }, fmt === "png" ? "image/png" : "image/jpeg", 0.92);
  }

  return (
    <div className="tool">
      <canvas ref={cv} className="preview" aria-label="Prévia da miniatura" />

      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="mt">Texto principal</label>
        <input id="mt" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Poucas palavras funcionam melhor" />
        <span className="count">Use poucas palavras: a miniatura aparece pequena no celular.</span>
      </div>
      <div className="field">
        <label htmlFor="tg">Etiqueta (opcional)</label>
        <input id="tg" type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ex.: NOVO, TUTORIAL, PASSO A PASSO" />
      </div>
      <div className="field">
        <span>Cores</span>
        <div className="speeds" role="group" aria-label="Cores">
          {THEMES.map((t) => <button key={t.id} type="button" className={theme.id === t.id ? "on" : ""} onClick={() => setTheme(t)}>{t.name}</button>)}
        </div>
      </div>
      <div className="field">
        <label htmlFor="im">Imagem do lado direito (opcional)</label>
        <input id="im" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
        {img && <button className="link" type="button" onClick={() => setImg(null)}>Tirar a imagem</button>}
      </div>
      <label className="inline"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Letras maiúsculas</label>

      <div className="rrow" style={{ marginTop: 16 }}>
        <button className="btn" type="button" onClick={save}>Baixar miniatura</button>
        <div className="speeds" role="group" aria-label="Formato">
          {(["jpg", "png"] as const).map((f) => <button key={f} type="button" className={fmt === f ? "on" : ""} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>)}
        </div>
      </div>
      <p className="note" aria-live="polite">{msg || "Tamanho 1280×720, o padrão do YouTube. Tudo é feito no seu aparelho."}</p>
    </div>
  );
}
