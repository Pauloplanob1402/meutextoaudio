"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const loading = () => <p className="note">Carregando…</p>;

// slug da página -> componente da ferramenta
const VIEWS: Record<string, ComponentType> = {
  "ideias-de-video": dynamic(() => import("./Ideas"), { loading }),
  "descricao-do-roteiro": dynamic(() => import("./ScriptDescription"), { loading }),
  "tempo-de-fala": dynamic(() => import("./SpeechTime"), { loading }),
  "dividir-texto": dynamic(() => import("./SplitBlocks"), { loading }),
  "juntar-audios": dynamic(() => import("./AudioJoin"), { loading }),
  "roteiro-em-4-batidas": dynamic(() => import("./FourBeats"), { loading }),
  "ajuste-de-volume": dynamic(() => import("./VolumeMeter"), { loading }),
  "audiolivro-em-lote": dynamic(() => import("./BatchAudio"), { loading }),
  "extrair-e-cortar-audio": dynamic(() => import("./AudioCut"), { loading }),
  "remover-silencio": dynamic(() => import("./Silence"), { loading }),
  "titulo-e-descricao": dynamic(() => import("./TitleCounter"), { loading }),
  "hashtags-e-tags": dynamic(() => import("./Hashtags"), { loading }),
  "capitulos": dynamic(() => import("./Chapters"), { loading }),
  "legendas-srt": dynamic(() => import("./Srt"), { loading }),
  "checklist-de-publicacao": dynamic(() => import("./Checklist"), { loading }),
  "redimensionar-imagem": dynamic(() => import("./ImageResize"), { loading }),
  "miniatura": dynamic(() => import("./Thumbnail"), { loading }),
  "calendario": dynamic(() => import("./Calendar"), { loading }),
  "validador-de-gancho": dynamic(() => import("./HookValidator"), { loading }),
  "gerador-de-titulos": dynamic(() => import("./TitleGenerator"), { loading }),
  "dna-de-marca": dynamic(() => import("./BrandDNA"), { loading }),
  "simulador-de-ctr": dynamic(() => import("./CtrSimulator"), { loading }),
  "roteiro-em-blocos": dynamic(() => import("./ScriptBlocks"), { loading }),
  "saiu-um": dynamic(() => import("./Posted"), { loading }),
  "plano-da-semana": dynamic(() => import("./WeekPlan"), { loading }),
  "painel-do-video": dynamic(() => import("./VideoBoard"), { loading }),
  "revisao-do-video": dynamic(() => import("./VideoReview"), { loading }),
  "planejador-de-serie": dynamic(() => import("./SeriesPlanner"), { loading }),
  "playbooks": dynamic(() => import("./PlaybookLibrary"), { loading }),
  "desafio-30-dias": dynamic(() => import("./Challenge30"), { loading }),
  "teleprompter": dynamic(() => import("./Teleprompter"), { loading }),
  "testador-de-titulos": dynamic(() => import("./TitleTester"), { loading }),
  "gerador-de-descricao": dynamic(() => import("./DescriptionBuilder"), { loading }),
  "limpador-de-roteiro": dynamic(() => import("./SpeechCleaner"), { loading }),
  "calculadora-de-frequencia": dynamic(() => import("./FrequencyCalc"), { loading }),
  "links-com-tempo": dynamic(() => import("./TimeLinks"), { loading }),
  "conversor-de-legenda": dynamic(() => import("./SubtitleConverter"), { loading }),
  "qr-code-do-canal": dynamic(() => import("./QrCodeTool"), { loading }),
  "banco-de-ideias": dynamic(() => import("./IdeaBank"), { loading }),
  "calculadora-de-ganhos": dynamic(() => import("./Earnings"), { loading }),
};

export default function ToolView({ slug }: { slug: string }) {
  const View = VIEWS[slug];
  return View ? <View /> : null;
}
