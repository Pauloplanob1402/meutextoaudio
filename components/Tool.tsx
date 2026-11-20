"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SAMPLE_TEXT, estimateSeconds, formatDuration, mergeParts, parseScript } from "@/lib/tts";
import { SELF_HOST, redirectVoiceDownloads, wasmPaths } from "@/lib/selfhost";
import { stretchWav } from "@/lib/stretch";
import { wavToMp3 } from "@/lib/mp3";
import { DEFAULT_VOICE_ID, VOICES, getVoice } from "@/lib/voices";

const HINT = "Dica: Ctrl + Enter também gera.";
const SPEEDS = [
  { label: "Mais devagar", v: 0.85 },
  { label: "Normal", v: 1 },
  { label: "Mais rápido", v: 1.2 },
];
const GROUPS = [
  { label: "Vozes rápidas · Português do Brasil", test: (v: (typeof VOICES)[number]) => v.engine === "piper" && v.lang === "pt-BR" },
  { label: "Vozes rápidas · Português de Portugal", test: (v: (typeof VOICES)[number]) => v.engine === "piper" && v.lang === "pt-PT" },
  { label: "Vozes naturais (mais lentas) · Português do Brasil", test: (v: (typeof VOICES)[number]) => v.engine === "kokoro" },
];
const HEIGHTS = [30,55,40,75,50,90,35,65,85,45,70,30,95,55,40,80,60,35,75,50,90,40,65,30,85,55,45,70,35,60,80,40,95,50,65,30,75,45,55,85];

export default function Tool() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ReactNode>(HINT);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [speed, setSpeed] = useState(0.85);
  const [dlBusy, setDlBusy] = useState(false);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [site, setSite] = useState("");
  const [copied, setCopied] = useState(false);
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const loadedVoice = useRef<string | null>(null);
  const original = useRef<Blob | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const au = useRef<HTMLAudioElement>(null);
  const res = useRef<HTMLDivElement>(null);
  const step = url ? 3 : text.trim() ? 2 : 1;
  const est = useMemo(() => estimateSeconds(text, speed), [text, speed]);

  // rascunho salvo só no navegador
  function update(v: string) {
    setText(v);
    try { localStorage.setItem("draft", v); } catch {}
  }
  useEffect(() => {
    setSite(window.location.origin);
    try { const d = localStorage.getItem("draft"); if (d) setText(d); } catch {}
    try { const v = localStorage.getItem("voz"); if (v) setVoiceId(getVoice(v).id); } catch {}
    if (window.matchMedia("(min-width:861px)").matches) ta.current?.focus();
  }, []);

  function pickVoice(id: string) {
    setVoiceId(id);
    try { localStorage.setItem("voz", id); } catch {}
  }

  function applySpeed() {
    if (!au.current) return;
    au.current.playbackRate = speed;
    au.current.preservesPitch = true;
  }
  useEffect(applySpeed, [speed, url]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  async function generate() {
    if (busy) return;
    if (!text.trim()) {
      setStatus("Cole um texto na caixa acima ou toque em “Usar um exemplo”.");
      ta.current?.focus();
      return;
    }
    setBusy(true);
    setUrl(null);
    setStatus("Preparando a voz… A primeira geração leva um pouco mais. As próximas são imediatas.");
    try {
      const parts = parseScript(text);
      const total = parts.filter((p) => p.kind === "text").length;
      if (!total) throw new Error("sem texto");

      const tts = await import("@mintplex-labs/piper-tts-web");
      const voice = getVoice(voiceId);
      let session: { predict: (t: string) => Promise<Blob> };
      if (voice.engine === "kokoro") {
        const { createKokoro } = await import("@/lib/kokoro");
        session = await createKokoro({
          voice: voice.kokoro!,
          bits: {
            piperWasm: wasmPaths?.piperWasm ?? `${tts.WASM_BASE}.wasm`,
            piperData: wasmPaths?.piperData ?? `${tts.WASM_BASE}.data`,
            onnxWasm: wasmPaths?.onnxWasm ?? tts.ONNX_BASE,
          },
          onProgress: (l, t) => setStatus(`Baixando a voz natural (só na primeira vez): ${Math.round((l * 100) / t)}%`),
        });
      } else {
        redirectVoiceDownloads(tts.PATH_MAP as Record<string, string>);
        // A biblioteca guarda uma sessão só. Para trocar de voz, descartamos a anterior.
        if (loadedVoice.current && loadedVoice.current !== voiceId) (tts.TtsSession as any)._instance = undefined;
        session = await tts.TtsSession.create({
          voiceId: voiceId as any,
          wasmPaths,
          progress: (p: any) => {
            if (p?.total && p.url !== "tts://inference-progress")
              setStatus(`Baixando a voz (só na primeira vez): ${Math.round((p.loaded * 100) / p.total)}%`);
          },
        });
      }

      const out: (Blob | number)[] = [];
      const skipped: string[] = [];
      let done = 0;
      for (const p of parts) {
        if (p.kind === "pause") { out.push(p.seconds); continue; }
        done++;
        setStatus(`Gerando o áudio… (${done} de ${total})`);
        try {
          out.push(await session.predict(p.text));
        } catch {
          try { out.push(await session.predict(p.text)); }
          catch (e) { console.error("Trecho pulado:", p.text, e); skipped.push(p.text); }
        }
        await new Promise((r) => setTimeout(r, 0)); // deixa a tela respirar
      }
      if (!out.some((x) => typeof x !== "number")) throw new Error("nenhum trecho");
      if (voice.engine === "piper") loadedVoice.current = voiceId;

      setStatus("Montando o áudio final…");
      const merged = await mergeParts(out);
      original.current = merged;
      setUrl(URL.createObjectURL(merged));
      setStatus(
        skipped.length
          ? `Pronto, mas ${skipped.length} trecho(s) não puderam ser lidos. Tente dividir o texto em partes menores.`
          : "Seu áudio está pronto."
      );
      requestAnimationFrame(() => res.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (e) {
      console.error(e);
      try { (((await import("@mintplex-labs/piper-tts-web")).TtsSession) as any)._instance = undefined; } catch {}
      loadedVoice.current = null;
      setStatus(`Não consegui gerar o áudio com a voz ${getVoice(voiceId).name}. Escolha outra voz, ou recarregue a página (F5) e tente de novo.`);
    } finally {
      setBusy(false);
    }
  }

  // Baixa na velocidade escolhida (ajuste feito no navegador, sem mudar o tom), em MP3 ou WAV
  async function download(originalSpeed = false) {
    const src = original.current;
    if (!src || dlBusy) return;
    const sp = originalSpeed ? 1 : speed;
    setDlBusy(true);
    let out = src;
    let stretched = false;
    let warn = "";
    try {
      if (sp !== 1) {
        try {
          setStatus("Ajustando a velocidade…");
          out = await stretchWav(src, sp);
          stretched = true;
        } catch (e) {
          console.error(e);
          warn = "Não consegui ajustar a velocidade do arquivo, então baixei na velocidade original. ";
          out = src;
        }
      }

      let ext = "wav";
      if (fmt === "mp3") {
        try {
          setStatus("Convertendo para MP3…");
          out = await wavToMp3(out);
          ext = "mp3";
        } catch (e) {
          console.error(e);
          warn += "Não consegui converter para MP3, então baixei em WAV.";
        }
      }

      const a = document.createElement("a");
      const u = URL.createObjectURL(out);
      a.href = u;
      a.download = stretched ? `narracao-saium-${sp}x.${ext}` : `narracao-saium.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(u), 10000);
      setStatus(warn.trim() || "Pronto! Download iniciado.");
    } finally {
      setDlBusy(false);
    }
  }

  // Convite para um amigo (aparece depois que o áudio fica pronto)
  const SHARE_MSG = "Conheça o Saium: texto em áudio em português do Brasil, direto no navegador:";
  function shareWhatsApp() {
    const link = site || window.location.origin;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_MSG} ${link}`)}`, "_blank", "noopener");
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(site || window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setStatus("Não consegui copiar. Copie o endereço direto da barra do navegador.");
    }
  }

  function insertPause() {
    const el = ta.current;
    const t = "\n\n[PAUSA - 2 segundos]\n\n";
    const a = el ? el.selectionStart : text.length;
    const z = el ? el.selectionEnd : text.length;
    update(text.slice(0, a) + t + text.slice(z));
    requestAnimationFrame(() => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = a + t.length; } });
  }

  function clear() {
    const saved = text;
    update("");
    setStatus(
      <>Texto apagado. <button className="link" type="button" onClick={() => { update(saved); setStatus("Texto de volta."); ta.current?.focus(); }}>Desfazer</button></>
    );
  }

  function again() {
    setUrl(null);
    update("");
    setStatus(HINT);
    window.scrollTo({ top: 0, behavior: "smooth" });
    ta.current?.focus();
  }

  return (
    <section className="stage" aria-labelledby="h">
      <p className="sa-eyebrow">Ferramenta principal</p>
      <h2 id="h">Texto em Áudio</h2>
      <p className="lead">Cole o roteiro, gere a narração e baixe em MP3 ou WAV. O seu texto não sai do seu aparelho.</p>

      <ol className="path" aria-label="Passo a passo">
        {["Cole seu texto", "Gere o áudio", "Ouça e baixe"].map((t, i) => (
          <li key={t} className={step === i + 1 ? "on" : step > i + 1 ? "done" : ""}><b>{i + 1}</b>{t}</li>
        ))}
      </ol>

      <div className="tool">
        <label className="big" htmlFor="txt">Cole ou escreva seu texto aqui</label>
        <textarea
          id="txt" ref={ta} value={text}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); generate(); } }}
          placeholder="Por exemplo: Olá! Este é o meu primeiro áudio."
        />
        <div className="aux">
          <button className="chip" type="button" onClick={() => { update(SAMPLE_TEXT); ta.current?.focus(); }}>Usar um exemplo</button>
          <button className="chip" type="button" onClick={insertPause}>Inserir pausa de 2 segundos</button>
          {text && <button className="chip" type="button" onClick={clear}>Limpar</button>}
        </div>
        {est > 0 && (
          <p className="note" style={{ margin: "-8px 0 16px" }}>
            Duração estimada do áudio: cerca de <b>{formatDuration(est)}</b>
          </p>
        )}
        <div className="voicepick">
          <label htmlFor="voz">Voz</label>
          <select id="voz" value={voiceId} onChange={(e) => pickVoice(e.target.value)} disabled={busy}>
            {GROUPS.map((g) => {
              const list = VOICES.filter((v) => g.test(v) && (!SELF_HOST || v.engine === "piper"));
              if (!list.length) return null;
              return (
                <optgroup key={g.label} label={g.label}>
                  {list.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.note}</option>)}
                </optgroup>
              );
            })}
          </select>
          {getVoice(voiceId).engine === "kokoro" && (
            <p className="note" style={{ flexBasis: "100%", margin: 0 }}>
              Voz natural: a primeira vez baixa cerca de 90 MB e a geração é bem mais lenta que a das vozes rápidas. Para textos longos, prefira a Faber.
            </p>
          )}
        </div>
        <div className="row">
          <button className="btn go" type="button" onClick={generate} disabled={busy}>{busy ? "Gerando…" : "Gerar meu áudio"}</button>
          <p className="status" role="status" aria-live="polite">{status}</p>
        </div>

        {busy && (
          <div className="wave on" aria-hidden="true" style={{ marginTop: 16 }}>
            {HEIGHTS.map((h, i) => <b key={i} style={{ height: `${h}%`, ["--i" as string]: i }} />)}
          </div>
        )}

        {url && (
          <div className="result" ref={res}>
            <h2>Seu áudio está pronto.</h2>
            <audio ref={au} src={url} controls onLoadedMetadata={applySpeed} />
            <div className="rrow" style={{ marginTop: 16 }}>
              <div className="speeds" role="group" aria-label="Velocidade">
                {SPEEDS.map((s) => (
                  <button key={s.v} type="button" className={speed === s.v ? "on" : ""} onClick={() => setSpeed(s.v)}>{s.label}</button>
                ))}
              </div>
              <div className="speeds" role="group" aria-label="Formato do arquivo">
                {(["mp3", "wav"] as const).map((f) => (
                  <button key={f} type="button" className={fmt === f ? "on" : ""} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>
                ))}
              </div>
              <button className="btn ghost" type="button" onClick={() => download()} disabled={dlBusy}>{dlBusy ? "Preparando…" : `Baixar ${fmt.toUpperCase()}`}</button>
            </div>
            <p className="note">O arquivo baixado sai na velocidade escolhida, já com as pausas. O MP3 é bem menor e abre em qualquer editor de vídeo. O WAV mantém a qualidade máxima, mas o arquivo é bem maior. Ajustes grandes de velocidade podem deixar a voz um pouco menos natural.</p>
            {speed !== 1 && <button className="link" type="button" onClick={() => download(true)} disabled={dlBusy}>Baixar na velocidade original</button>}
            <button className="link" type="button" onClick={again}>Gerar outro texto</button>
            <div className="invite" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <p style={{ fontWeight: 600 }}>Gostou? Indique o Saium a outro criador.</p>
              <div className="rrow" style={{ marginTop: 10 }}>
                <button className="btn ghost" type="button" onClick={shareWhatsApp}>Enviar pelo WhatsApp</button>
                <button className="btn ghost" type="button" onClick={copyLink}>{copied ? "Link copiado!" : "Copiar link"}</button>
              </div>
            </div>
          </div>
        )}
        <p className="note">Cada voz é baixada uma única vez (cerca de 60 MB a maioria) e fica salva no seu navegador. A primeira geração com uma voz nova demora um pouco mais. Nas próximas, é imediato.</p>
      </div>
    </section>
  );
}
