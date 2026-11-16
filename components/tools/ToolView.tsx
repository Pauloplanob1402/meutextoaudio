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
  "calculadora-de-ganhos": dynamic(() => import("./Earnings"), { loading }),
};

export default function ToolView({ slug }: { slug: string }) {
  const View = VIEWS[slug];
  return View ? <View /> : null;
}
