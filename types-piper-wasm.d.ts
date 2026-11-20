// O motor de pronúncia do Piper não traz tipos. Só precisamos da função que o cria.
declare module "@diffusionstudio/piper-wasm/build/piper_phonemize.js" {
  const create: (options: Record<string, unknown>) => Promise<{ callMain: (args: string[]) => void }>;
  export default create;
}
