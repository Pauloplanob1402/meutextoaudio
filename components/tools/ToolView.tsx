"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const loading = () => <p className="note">Carregando…</p>;

// slug da página -> componente da ferramenta
const VIEWS: Record<string, ComponentType> = {
  "ideias-de-video": dynamic(() => import("./Ideas"), { loading }),
  "tempo-de-fala": dynamic(() => import("./SpeechTime"), { loading }),
  "dividir-texto": dynamic(() => import("./SplitBlocks"), { loading }),
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
  "calculadora-de-ganhos": dynamic(() => import("./Earnings"), { loading }),
};

export default function ToolView({ slug }: { slug: string }) {
  const View = VIEWS[slug];
  return View ? <View /> : null;
}
