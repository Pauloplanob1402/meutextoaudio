// Plano da semana: dado os dias de publicação, monta as tarefas de cada vídeo ligadas às ferramentas do Sauim.
import { isoDay } from "./saiuUm";

export const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;
export const DAY_LONG = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"] as const;

export type Stage = { id: string; label: string; offset: number; tools: { href: string; label: string }[] };
// offset = quantos dias antes da publicação a tarefa é feita (0 = no dia)
export const STAGES: Stage[] = [
  { id: "ideia", label: "Escolher a ideia e o título", offset: 3, tools: [{ href: "/ferramentas/ideias-de-video", label: "Ideias de vídeo" }, { href: "/ferramentas/gerador-de-titulos", label: "Gerador de títulos" }] },
  { id: "roteiro", label: "Escrever o roteiro e conferir o começo", offset: 2, tools: [{ href: "/ferramentas/roteiro-em-4-batidas", label: "Roteiro em 4 batidas" }, { href: "/ferramentas/validador-de-gancho", label: "Validador de gancho" }] },
  { id: "audio", label: "Gravar ou gerar a narração e acertar o volume", offset: 1, tools: [{ href: "/", label: "Texto em áudio" }, { href: "/ferramentas/ajuste-de-volume", label: "Ajuste de volume" }] },
  { id: "capa", label: "Fazer a miniatura e a descrição", offset: 0, tools: [{ href: "/ferramentas/miniatura", label: "Miniatura" }, { href: "/ferramentas/descricao-do-roteiro", label: "Descrição do roteiro" }] },
  { id: "publicar", label: "Conferir e publicar", offset: 0, tools: [{ href: "/ferramentas/checklist-de-publicacao", label: "Checklist de publicação" }, { href: "/ferramentas/saiu-um", label: "Saiu um!" }] },
];

const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export function mondayOf(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return isoDay(x);
}

export type Task = { key: string; video: number; stage: Stage; day: number }; // day: 0=segunda … 6=domingo

// publishDays: índices 0..6 dos dias em que um vídeo sai (um vídeo por dia). Tarefas que cairiam antes da segunda ficam na segunda.
export function buildPlan(weekStart: string, publishDays: number[]): { byDay: Task[][]; videos: number } {
  const days = [...new Set(publishDays)].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b);
  const byDay: Task[][] = Array.from({ length: 7 }, () => []);
  days.forEach((pd, i) => {
    STAGES.forEach((stage) => {
      const day = Math.max(0, pd - stage.offset);
      byDay[day].push({ key: `${weekStart}:${pd}:${stage.id}`, video: i + 1, stage, day });
    });
  });
  return { byDay, videos: days.length };
}

export const dayDate = (weekStart: string, i: number) => {
  const d = parse(weekStart);
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};
