// Estado compartilhado do Texto em áudio "sempre ligado".
// O componente do Texto em áudio fica na estrutura do site (fora da página) e só é encaixado na página inicial.
// Assim, quando a pessoa abre outra ferramenta, a geração continua, e a barra global mostra o andamento.
import { useSyncExternalStore } from "react";

export type HostState = {
  requested: boolean; // a página inicial já pediu o Texto em áudio
  loaded: boolean; // o Texto em áudio terminou de carregar
  attached: boolean; // ele está visível na página atual
  busy: boolean; // gerando agora
  ready: boolean; // existe um áudio pronto
  status: string; // última mensagem de texto do Texto em áudio
  away: boolean; // terminou enquanto a pessoa estava em outra página
  tick: number; // sobe a cada vez que a pessoa volta para a página inicial
};

const initial: HostState = { requested: false, loaded: false, attached: false, busy: false, ready: false, status: "", away: false, tick: 0 };
let state: HostState = initial;
const subs = new Set<() => void>();
const set = (p: Partial<HostState>) => {
  state = { ...state, ...p };
  subs.forEach((f) => f());
};

export const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
export const useToolHost = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => initial
  );

export const requestHost = () => {
  if (!state.requested) set({ requested: true });
};
export const setAttached = (attached: boolean) => set(attached ? { attached: true, away: false, tick: state.tick + 1 } : { attached: false });
export const dismissAway = () => set({ away: false });

// O Texto em áudio avisa o que está acontecendo. Se terminou com a pessoa em outra página, marca "away".
export function publishToolState(p: { busy: boolean; ready: boolean; status: string }) {
  const finishedAway = state.busy && !p.busy && !state.attached;
  set({ ...p, loaded: true, away: finishedAway ? true : state.away });
}

// O "lugar" onde o Texto em áudio vive. É um elemento solto, que a página inicial encaixa e desencaixa.
let hostEl: HTMLDivElement | null = null;
export function getHostElement(): HTMLDivElement {
  if (!hostEl) {
    hostEl = document.createElement("div");
    hostEl.style.display = "contents";
    hostEl.setAttribute("data-tool-host", "");
  }
  return hostEl;
}
