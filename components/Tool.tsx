"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SAMPLE_TEXT, sampleLine, estimateSeconds, formatDuration, mergeParts, parseScript, scriptStats } from "@/lib/tts";
import { SELF_HOST, redirectVoiceDownloads, wasmPaths } from "@/lib/selfhost";
import { stretchWav } from "@/lib/stretch";
import { wavToMp3 } from "@/lib/mp3";
import { DEFAULT_FREE_VOICE_ID, VOICES, getVoice as getBuiltInVoice } from "@/lib/voices";
import { CLONE_ID, CLONE_INFO, QUALITY, createCloneSession, getQuality, hasRef, setQuality as storeCloneQuality } from "@/lib/cloneVoice";

// as vozes da lista + a "Minha voz (beta)", que não entra em VOICES (a gravação mora só neste aparelho)
const getVoice = (id: string) => (id === CLONE_ID ? CLONE_INFO : getBuiltInVoice(id));
import { PACOTE_ON, createMeter, type Cue } from "@/lib/pacote";
import PacoteDoVideo from "@/components/PacoteDoVideo";
import { publishToolState, useToolHost } from "@/lib/toolHost";

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
const SAMPLE_LINE = "Olá! Esta é a minha voz. Veja se ela combina com o seu vídeo.";
const HEIGHTS = [30,55,40,75,50,90,35,65,85,45,70,30,95,55,40,80,60,35,75,50,90,40,65,30,85,55,45,70,35,60,80,40,95,50,65,30,75,45,55,85];

export default function Tool() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ReactNode>(HINT);
  const [busy, setBusy] = useState(false);
  const [sampling, setSampling] = useState(false);
  const sampleUrl = useRef<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [speed, setSpeed] = useState(0.85);
  const [dlBusy, setDlBusy] = useState(false);
  const [fmt, setFmt] = useState<"mp3" | "wav">("mp3");
  const [site, setSite] = useState("");
  const [copied, setCopied] = useState(false);
  const [voiceId, setVoiceId] = useState(DEFAULT_FREE_VOICE_ID);
  const [plan, setPlan] = useState<"loading" | "free" | "pro">("loading");
  const [hasClone, setHasClone] = useState(false);
  const [cloneQ, setCloneQ] = useState("portuguese");
  const savedVoice = useRef(false);
  const loadedVoice = useRef<string | null>(null);
  const original = useRef<Blob | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const au = useRef<HTMLAudioElement>(null);
  const res = useRef<HTMLDivElement>(null);
  const step = url ? 3 : text.trim() ? 2 : 1;
  // Ritmo real de cada voz (palavras por minuto), medido nos áudios que ela já gerou neste aparelho.
  const [wpmMap, setWpmMap] = useState<Record<string, number>>({});
  const [realDur, setRealDur] = useState(0); // duração real do áudio gerado, na velocidade original
  const genInfo = useRef<{ words: number; pauses: number; voice: string } | null>(null);
  const [pacote, setPacote] = useState<{ cues: Cue[]; raw: string } | null>(null); // legenda e capítulos do último áudio
  const host = useToolHost();

  // Avisa a barra global (geração em segundo plano) o que está acontecendo
  useEffect(() => {
    publishToolState({ busy, ready: !!url, status: typeof status === "string" ? status : "" });
  }, [busy, url, status]);
  // Ao voltar para a página inicial, confere de novo o plano (a pessoa pode ter entrado ou assinado enquanto isso)
  useEffect(() => {
    if (host.tick < 2) return;
    setHasClone(hasRef());
    fetch("/api/plano", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setPlan(j.plan === "pro" ? "pro" : "free"))
      .catch(() => {});
  }, [host.tick]);
  const est = useMemo(() => estimateSeconds(text, speed, wpmMap[voiceId]), [text, speed, wpmMap, voiceId]);

  // rascunho salvo só no navegador
  function update(v: string) {
    setText(v);
    try { localStorage.setItem("draft", v); } catch {}
  }
  useEffect(() => {
    setSite(window.location.origin);
    try { const d = localStorage.getItem("draft"); if (d) setText(d); } catch {}
    try { const m = JSON.parse(localStorage.getItem("wpm") || "{}"); if (m && typeof m === "object") setWpmMap(m); } catch {}
    setHasClone(hasRef()); setCloneQ(getQuality());
    try { const v = localStorage.getItem("voz"); if (v) { setVoiceId(v === CLONE_ID ? (hasRef() ? CLONE_ID : DEFAULT_FREE_VOICE_ID) : getVoice(v).id); savedVoice.current = true; } } catch {}
    fetch("/api/plano", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setPlan(j.plan === "pro" ? "pro" : "free"))
      .catch(() => setPlan("free"));
    if (window.matchMedia("(min-width:861px)").matches) ta.current?.focus({ preventScroll: true });
  }, []);

  // quem tem o plano Criador e nunca escolheu voz começa pela Faber
  useEffect(() => {
    if (plan === "pro" && !savedVoice.current) setVoiceId("pt_BR-faber-medium");
  }, [plan]);

  const voice = getVoice(voiceId);
  const locked = voice.plan === "pro" && plan !== "pro";

  function pickVoice(id: string) {
    savedVoice.current = true;
    setVoiceId(id);
    try { localStorage.setItem("voz", id); } catch {}
  }

  // Quando o áudio carrega, guarda a duração real e aprende o ritmo da voz para as próximas estimativas.
  function onMeta() {
    applySpeed();
    const d = au.current?.duration;
    if (!d || !isFinite(d)) return;
    setRealDur(d);
    const g = genInfo.current;
    genInfo.current = null;
    if (!g || g.words < 20) return;
    const talk = d - g.pauses;
    if (talk <= 0) return;
    const wpm = Math.round(Math.min(300, Math.max(80, (g.words / talk) * 60)));
    setWpmMap((m) => {
      const next = { ...m, [g.voice]: wpm };
      try { localStorage.setItem("wpm", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function applySpeed() {
    if (!au.current) return;
    au.current.playbackRate = speed;
    au.current.preservesPitch = true;
  }
  useEffect(applySpeed, [speed, url]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => () => { if (sampleUrl.current) URL.revokeObjectURL(sampleUrl.current); }, []);

  // Abre a sessão de voz (baixa a voz na primeira vez). Usada pela geração e pela amostra.
  async function openSession(): Promise<{ predict: (t: string) => Promise<Blob> }> {
    if (voiceId === CLONE_ID) return createCloneSession(setStatus);
    const tts = await import("@mintplex-labs/piper-tts-web");
    const voice = getVoice(voiceId);
    if (voice.engine === "kokoro") {
      const { createKokoro } = await import("@/lib/kokoro");
      return createKokoro({
        voice: voice.kokoro!,
        bits: {
          piperWasm: wasmPaths?.piperWasm ?? `${tts.WASM_BASE}.wasm`,
          piperData: wasmPaths?.piperData ?? `${tts.WASM_BASE}.data`,
          onnxWasm: wasmPaths?.onnxWasm ?? tts.ONNX_BASE,
        },
        onProgress: (l, t) => setStatus(`Baixando a voz natural (só na primeira vez): ${Math.round((l * 100) / t)}%`),
      });
    }
    redirectVoiceDownloads(tts.PATH_MAP as Record<string, string>);
    // A biblioteca guarda uma sessão só. Para trocar de voz, descartamos a anterior.
    if (loadedVoice.current && loadedVoice.current !== voiceId) (tts.TtsSession as any)._instance = undefined;
    return tts.TtsSession.create({
      voiceId: voiceId as any,
      wasmPaths,
      progress: (p: any) => {
        if (p?.total && p.url !== "tts://inference-progress")
          setStatus(`Baixando a voz (só na primeira vez): ${Math.round((p.loaded * 100) / p.total)}%`);
      },
    });
  }

  // Amostra de uns 5 segundos com a voz e a velocidade escolhidas, antes de gerar o áudio inteiro
  async function sample() {
    if (busy || sampling) return;
    setSampling(true);
    setStatus("Preparando a amostra… A primeira vez baixa a voz e leva um pouco mais.");
    try {
      const first = parseScript(text).find((p) => p.kind === "text");
      const line = first && first.kind === "text" ? sampleLine(first.text) : SAMPLE_LINE;
      const session = await openSession();
      const blob = await session.predict(line);
      if (voice.engine === "piper") loadedVoice.current = voiceId;
      if (sampleUrl.current) URL.revokeObjectURL(sampleUrl.current);
      const u = URL.createObjectURL(blob);
      sampleUrl.current = u;
      const a = new Audio(u);
      a.playbackRate = speed;
      (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
      a.onended = () => setStatus(HINT);
      await a.play();
      setStatus(`Ouvindo a amostra da voz ${voice.name}${speed !== 1 ? ` (velocidade ${speed.toString().replace(".", ",")}x)` : ""}.`);
    } catch (e) {
      console.error(e);
      try { (((await import("@mintplex-labs/piper-tts-web")).TtsSession) as any)._instance = undefined; } catch {}
      loadedVoice.current = null;
      setStatus(`Não foi possível gerar a amostra com a voz ${voice.name}. Tente outra voz ou recarregue a página (F5).`);
    } finally {
      setSampling(false);
    }
  }

  async function generate() {
    if (busy) return;
    if (locked) {
      setStatus(`A voz ${voice.name} faz parte do plano Criador. Escolha uma voz gratuita ou assine na página Minha conta.`);
      return;
    }
    if (!text.trim()) {
      setStatus("Cole um texto na caixa acima ou toque em “Usar um exemplo”.");
      ta.current?.focus();
      return;
    }
    setBusy(true);
    setUrl(null);
    setStatus("Preparando a voz… A primeira geração leva um pouco mais. As próximas são imediatas.");
    setPacote(null);
    try {
      const parts = parseScript(text);
      const total = parts.filter((p) => p.kind === "text").length;
      if (!total) throw new Error("sem texto");

      const voice = getVoice(voiceId);
      const session = await openSession();

      const out: (Blob | number)[] = [];
      const skipped: string[] = [];
      let done = 0;
      // Pacote do vídeo: anota quando cada trecho começa e termina. Se algo falhar aqui, o áudio sai normal.
      const cues: Cue[] = [];
      let clock = 0;
      let cuesOk = PACOTE_ON;
      let meter: ReturnType<typeof createMeter> | null = null;
      if (PACOTE_ON) { try { meter = createMeter(); } catch { cuesOk = false; } }
      for (const p of parts) {
        if (p.kind === "pause") { out.push(p.seconds); clock += p.seconds; continue; }
        done++;
        setStatus(`Gerando o áudio… (${done} de ${total})`);
        const before = out.length;
        try {
          out.push(await session.predict(p.text));
        } catch {
          try { out.push(await session.predict(p.text)); }
          catch (e) { console.error("Trecho pulado:", p.text, e); skipped.push(p.text); }
        }
        if (meter && cuesOk && out.length > before) {
          try {
            const sil = await meter.analyze(out[out.length - 1] as Blob);
            const d = sil.duration;
            cues.push({ idx: done - 1, text: p.text, start: clock, end: clock + d, lead: sil.lead, trail: sil.trail, gaps: sil.gaps });
            clock += d;
          } catch { cuesOk = false; }
        }
        await new Promise((r) => setTimeout(r, 0)); // deixa a tela respirar
      }
      if (!out.some((x) => typeof x !== "number")) throw new Error("nenhum trecho");
      if (voice.engine === "piper") loadedVoice.current = voiceId;

      setStatus("Montando o áudio final…");
      const merged = await mergeParts(out);
      meter?.close();
      setPacote(PACOTE_ON && cuesOk && cues.length ? { cues, raw: text } : null);
      original.current = merged;
      genInfo.current = { ...scriptStats(text), voice: voiceId };
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
      setStatus(`Não foi possível gerar o áudio com a voz ${getVoice(voiceId).name}. Escolha outra voz ou recarregue a página (F5) e tente novamente.`);
    } finally {
      setBusy(false);
    }
  }

  // Baixa na velocidade escolhida (ajuste feito no navegador, sem mudar o tom), em MP3 ou WAV
  // Monta o arquivo final (velocidade e formato escolhidos). Usada pelo botão de baixar e pelo zip do Pacote do vídeo.
  async function buildAudio(originalSpeed = false): Promise<{ blob: Blob; name: string; warn: string } | null> {
    const src = original.current;
    if (!src) return null;
    const sp = originalSpeed ? 1 : speed;
    let out = src;
    let stretched = false;
    let warn = "";
    if (sp !== 1) {
      try {
        setStatus("Ajustando a velocidade…");
        out = await stretchWav(src, sp);
        stretched = true;
      } catch (e) {
        console.error(e);
        warn = "Não foi possível ajustar a velocidade. O arquivo foi baixado na velocidade original. ";
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
        warn += "Não foi possível converter para MP3. O arquivo foi baixado em WAV.";
      }
    }
    return { blob: out, name: stretched ? `narracao-sauim-${sp}x.${ext}` : `narracao-sauim.${ext}`, warn };
  }

  async function download(originalSpeed = false) {
    if (!original.current || dlBusy) return;
    setDlBusy(true);
    try {
      const r = await buildAudio(originalSpeed);
      if (!r) return;
      const a = document.createElement("a");
      const u = URL.createObjectURL(r.blob);
      a.href = u;
      a.download = r.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(u), 10000);
      setStatus(r.warn.trim() || "Download iniciado.");
    } finally {
      setDlBusy(false);
    }
  }

  // Convite para um amigo (aparece depois que o áudio fica pronto)
  const SHARE_MSG = "Conheça o Sauim: texto em áudio em português do Brasil, direto no navegador:";
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
      setStatus("Não foi possível copiar. Copie o endereço direto da barra do navegador.");
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
                  {list.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.note}{v.plan === "pro" ? " · Plano Criador" : ""}</option>)}
                </optgroup>
              );
            })}
            {hasClone && !SELF_HOST && (
              <optgroup label="Minha voz (beta)">
                <option value={CLONE_ID}>Minha voz · Beta, só no computador · Plano Criador</option>
              </optgroup>
            )}
          </select>
          {locked && plan !== "loading" && (
            <p className="note" role="status" style={{ flexBasis: "100%", margin: 0 }}>
              A voz {voice.name} faz parte do plano Criador. <a href="/conta">Assine para usar</a> ou escolha uma voz gratuita.
            </p>
          )}
          {!locked && voice.engine === "clone" && (
            <p className="note" style={{ flexBasis: "100%", margin: 0 }}>
              <b>Beta.</b> Use no computador (Chrome ou Edge). É bem mais lenta que as outras vozes e pode errar a pronúncia de algumas palavras. A gravação da sua voz fica só neste aparelho; para trocá-la, use a ferramenta <a href="/ferramentas/minha-voz-beta">Minha voz (beta)</a>.
              <span style={{ display: "block", marginTop: 6 }}>Qualidade:{" "}
                {QUALITY.map((q) => <button key={q.id} type="button" className="chip" aria-pressed={cloneQ === q.id} style={{ marginRight: 6, ...(cloneQ === q.id ? { borderColor: "var(--blue)", color: "var(--blue)", background: "rgba(0,0,0,0.04)" } : {}) }} disabled={busy} onClick={() => { setCloneQ(q.id); storeCloneQuality(q.id); }}>{q.label}</button>)}
                {" "}“Melhor qualidade” soa melhor e demora mais.
              </span>
            </p>
          )}
          {!locked && voice.engine === "kokoro" && (
            <p className="note" style={{ flexBasis: "100%", margin: 0 }}>
              Voz natural: a primeira vez baixa cerca de 90 MB e a geração é bem mais lenta que a das vozes rápidas. Para textos longos, prefira a Faber.
            </p>
          )}
        </div>
        <div className="row">
          <button className="btn go" type="button" onClick={generate} disabled={busy || sampling || locked}>{busy ? "Gerando…" : "Gerar meu áudio"}</button>
          <button className="btn ghost" type="button" onClick={sample} disabled={busy || sampling}>{sampling ? "Preparando…" : "Ouvir amostra de 5 s"}</button>
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
            <audio ref={au} src={url} controls onLoadedMetadata={onMeta} />
            {realDur > 0 && <p className="note" style={{ marginTop: 8 }}>Duração na velocidade escolhida: <b>{formatDuration(realDur / speed)}</b>.{speed !== 1 && <> O player mostra a duração original ({formatDuration(realDur)}).</>}</p>}
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
            <button className="link" type="button" onClick={again} style={{ marginLeft: speed !== 1 ? 16 : 0 }}>Gerar outro texto</button>
            {pacote && <PacoteDoVideo cues={pacote.cues} raw={pacote.raw} speed={speed} getAudio={buildAudio} />}
            <div className="invite" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <p style={{ fontWeight: 600 }}>Gostou? Indique o Sauim a outro criador.</p>
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
