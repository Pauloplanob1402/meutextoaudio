"use client";
// Guarda a gravação de referência da "Minha voz" (a voz clonada do plano Criador).
// Duas cópias: no navegador (rápida, funciona sem internet) e na conta do usuário (Supabase, tabela
// public.minha_voz, bloco 6 do supabase/schema.sql), para a voz aparecer em qualquer aparelho e
// ficar disponível no Texto em áudio sem gravar de novo.
import { createClient } from "@/lib/supabase/client";

const LOCAL = "minha-voz-ref"; // mesma chave e formato de antes: {rate, data}
export const REF_RATE = 24000; // taxa do modelo; na conta guardamos já nessa taxa (arquivo menor)

export type SavedRef = { samples: Float32Array; rate: number };
export type RemoteResult = "ok" | "no-login" | "error";

export function encodePcm(samples: Float32Array): string {
  const i16 = new Int16Array(samples.length);
  for (let i = 0; i < i16.length; i++) i16[i] = Math.max(-1, Math.min(1, samples[i])) * 0x7fff;
  const u8 = new Uint8Array(i16.buffer);
  let bin = "";
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function decodePcm(b64: string): Float32Array {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const i16 = new Int16Array(u8.buffer);
  const f = new Float32Array(i16.length);
  for (let i = 0; i < f.length; i++) f[i] = i16[i] / 0x7fff;
  return f;
}

function resample(data: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return data;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(data.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const src = i * ratio, lo = Math.floor(src), hi = Math.min(lo + 1, data.length - 1), t = src - lo;
    out[i] = data[lo] * (1 - t) + data[hi] * t;
  }
  return out;
}

// ---------- no navegador ----------
export function readLocal(): SavedRef | null {
  try {
    const j = JSON.parse(localStorage.getItem(LOCAL) || "null");
    if (!j?.data) return null;
    return { rate: j.rate, samples: decodePcm(j.data) };
  } catch { return null; }
}
export function writeLocal(r: SavedRef) {
  try { localStorage.setItem(LOCAL, JSON.stringify({ rate: r.rate, data: encodePcm(r.samples) })); } catch { /* sem espaço ou bloqueado */ }
}
export function clearLocal() {
  try { localStorage.removeItem(LOCAL); } catch { /* ignora */ }
}

// ---------- na conta ----------
async function userId(): Promise<string | null> {
  const { data } = await createClient().auth.getUser();
  return data.user?.id ?? null;
}

export async function loadRemote(): Promise<SavedRef | null> {
  try {
    if (!(await userId())) return null;
    const { data, error } = await createClient().from("minha_voz").select("rate, audio").maybeSingle();
    if (error || !data?.audio) return null;
    return { rate: Number(data.rate) || REF_RATE, samples: decodePcm(data.audio as string) };
  } catch { return null; }
}

// Só confere se já existe uma voz na conta, sem baixar o áudio. null = sem login ou sem resposta.
export async function hasRemote(): Promise<boolean | null> {
  try {
    if (!(await userId())) return null;
    const { data, error } = await createClient().from("minha_voz").select("user_id").maybeSingle();
    return error ? null : Boolean(data);
  } catch { return null; }
}

export async function saveRemote(r: SavedRef): Promise<RemoteResult> {
  try {
    const id = await userId();
    if (!id) return "no-login";
    const s = resample(r.samples, r.rate, REF_RATE);
    const { error } = await createClient().from("minha_voz").upsert({
      user_id: id, rate: REF_RATE, seconds: s.length / REF_RATE, audio: encodePcm(s), updated_at: new Date().toISOString(),
    });
    if (error) { console.error("minha_voz:", error.message); return "error"; }
    return "ok";
  } catch (e) { console.error(e); return "error"; }
}

export async function deleteRemote(): Promise<RemoteResult> {
  try {
    const id = await userId();
    if (!id) return "no-login";
    const { error } = await createClient().from("minha_voz").delete().eq("user_id", id);
    return error ? "error" : "ok";
  } catch { return "error"; }
}

// Para o Texto em áudio: usa a cópia do navegador e, se não houver, busca na conta (e guarda no navegador).
export async function getMyVoice(): Promise<SavedRef | null> {
  const l = readLocal();
  if (l) return l;
  const r = await loadRemote();
  if (r) writeLocal(r);
  return r;
}
