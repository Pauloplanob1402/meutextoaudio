// "Saiu um!": contagem de vídeos publicados e sequência de semanas. Lógica pura (datas locais, AAAA-MM-DD).

export type Posted = { id: string; date: string; title: string };

export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

// Segunda-feira da semana de uma data (as semanas vão de segunda a domingo)
export function weekStart(s: string): string {
  const d = parse(s);
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return isoDay(d);
}
const addDays = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return isoDay(d); };

export type Stats = {
  total: number; month: number; thisWeek: number; goal: number;
  streak: number; best: number; weeks: { start: string; count: number }[]; weekDone: boolean;
};

export function computeStats(items: Posted[], goal: number, today: string, weeksShown = 8): Stats {
  goal = Math.max(1, Math.min(7, Math.round(goal) || 1));
  const perWeek = new Map<string, number>();
  for (const p of items) { const w = weekStart(p.date); perWeek.set(w, (perWeek.get(w) ?? 0) + 1); }
  const cur = weekStart(today);
  const thisWeek = perWeek.get(cur) ?? 0;

  // sequência atual: semanas seguidas que bateram a meta; a semana em andamento ainda não quebra a sequência
  let streak = 0;
  let w = thisWeek >= goal ? cur : addDays(cur, -7);
  while ((perWeek.get(w) ?? 0) >= goal) { streak++; w = addDays(w, -7); }

  // melhor sequência de todas
  const keys = [...perWeek.keys()].filter((k) => (perWeek.get(k) ?? 0) >= goal).sort();
  let best = 0, run = 0, prev = "";
  for (const k of keys) {
    run = prev && addDays(prev, 7) === k ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  }

  const weeks = Array.from({ length: weeksShown }, (_, i) => {
    const start = addDays(cur, -7 * (weeksShown - 1 - i));
    return { start, count: perWeek.get(start) ?? 0 };
  });
  const month = items.filter((p) => p.date.slice(0, 7) === today.slice(0, 7)).length;
  return { total: items.length, month, thisWeek, goal, streak, best, weeks, weekDone: thisWeek >= goal };
}

export const fmtDay = (s: string) => parse(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
