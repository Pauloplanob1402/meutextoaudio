"use client";
import { useEffect, useState } from "react";

// Guarda um valor no navegador (localStorage), sem quebrar se estiver bloqueado
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {}
  }, [key]);
  const set = (v: T) => {
    setValue(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  };
  return [value, set] as const;
}

export function CopyButton({ text, label = "Copiar", disabled }: { text: string; label?: string; disabled?: boolean }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    } catch {
      window.prompt("Copie o texto abaixo (Ctrl + C):", text);
    }
  }
  return (
    <button className="btn ghost" type="button" onClick={copy} disabled={disabled || !text}>
      {ok ? "Copiado!" : label}
    </button>
  );
}

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  const u = URL.createObjectURL(blob);
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 10000);
}

export const downloadText = (text: string, name: string, type = "text/plain") =>
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), name);

export const fmtNum = (n: number) => n.toLocaleString("pt-BR");
