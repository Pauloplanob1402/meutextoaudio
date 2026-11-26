// Testes das contas do Pacote do vídeo (sem navegador). Rode com:  npx tsx scripts/testar-pacote.ts
import { parseScript } from "../lib/tts";
import { buildPackage, originalChunks, srtTime, type Cue } from "../lib/pacote";

let falhas = 0;
const ok = (cond: boolean, nome: string, extra = "") => { if (!cond) falhas++; console.log(`${cond ? "OK   " : "FALHOU"} ${nome}${cond ? "" : "  -> " + extra}`); };

// Simula o laço do site: cada trecho "dura" 0,065 s por caractere; pausas somam ao relógio; trechos podem ser pulados.
function simular(raw: string, pular: number[] = []) {
  const parts = parseScript(raw);
  const cues: Cue[] = [];
  let clock = 0, idx = -1;
  for (const p of parts) {
    if (p.kind === "pause") { clock += p.seconds; continue; }
    idx++;
    if (pular.includes(idx)) continue;
    const d = p.text.length * 0.065;
    cues.push({ idx, text: p.text, start: clock, end: clock + d });
    clock += d;
  }
  return { cues, total: clock };
}

const ROTEIRO = `[CAPÍTULO: Introdução]
Olá! Este é um teste do Pacote do vídeo do Sauim. Vamos conferir se a legenda e os capítulos ficam no lugar certo. Se você está ouvindo isto, o áudio foi gerado com sucesso e deu tudo certo por aqui.

[PAUSA 3]

[CAPÍTULO: Primeiro passo]
Agora começa o primeiro passo. A ideia é simples: cada trecho do texto vira uma parte do áudio, e o Sauim sabe exatamente quando cada parte começa. Isso permite criar a legenda sem você digitar nenhum tempo.

[CAPÍTULO: Segundo passo]
Este é o segundo passo. Aqui vamos testar números e símbolos: o preço é R$ 39,90 por mês, com desconto de 17% no plano anual. A legenda deve mostrar esses símbolos do jeito certo, exatamente como estão escritos neste texto, e não de outro jeito.

[CAPÍTULO: Conclusão]
Por fim, a conclusão. Se os capítulos aparecem com os horários certos, o teste deu certo. Obrigado por testar o Sauim!`;

// 1) o texto original acompanha o parseScript, trecho por trecho
{
  const n = parseScript(ROTEIRO).filter((p) => p.kind === "text").length;
  ok(originalChunks(ROTEIRO).length === n, "trechos originais batem com o motor de voz", `${originalChunks(ROTEIRO).length} x ${n}`);
  const textos = ["a [PAUSA 2] b", "[x] Oi!\n\n\n\nTchau.", "só ... ---", "R$ 10 e 5%. Fim!"];
  textos.forEach((t) => ok(originalChunks(t).length === parseScript(t).filter((p) => p.kind === "text").length, `alinhamento: ${JSON.stringify(t).slice(0, 30)}`));
}

// 2) legenda: formato, ordem, tamanho de linha, símbolos preservados
{
  const { cues } = simular(ROTEIRO);
  const r = buildPackage(cues, ROTEIRO, 1);
  const blocos = r.srt.trim().split("\n\n");
  ok(blocos.length === r.count && r.count >= 8, "legenda tem vários blocos numerados", String(r.count));
  ok(/^1\n00:00:00,000 --> /.test(r.srt), "primeira legenda começa em 00:00:00,000");
  ok(r.srt.includes("R$ 39,90") && r.srt.includes("17%"), "símbolos $ e % preservados na legenda");
  ok(!r.srt.includes("[CAP"), "marcas de capítulo não aparecem na legenda");
  let ordem = true, linhas = true, ant = -1;
  for (const b of blocos) {
    const [, t, ...tx] = b.split("\n");
    const [a, z] = t.split(" --> ");
    const toS = (x: string) => { const [h, m, s] = x.split(":"); return +h * 3600 + +m * 60 + parseFloat(s.replace(",", ".")); };
    if (!(toS(a) >= ant && toS(z) > toS(a))) ordem = false;
    ant = toS(z) - 0.0011; // fim de uma não passa do começo da próxima
    if (tx.length > 2 || tx.some((l) => l.length > 42)) linhas = false;
  }
  ok(ordem, "tempos sempre crescentes, sem sobreposição");
  ok(linhas, "no máximo 2 linhas de até 42 caracteres");
  ok(srtTime(3723.456) === "01:02:03,456", "formato de hora do .srt");
}

// 3) capítulos: horários = início do primeiro trecho depois de cada marca
{
  const { cues } = simular(ROTEIRO);
  const r = buildPackage(cues, ROTEIRO, 1);
  console.log(r.chapters.output.split("\n").map((l) => "      " + l).join("\n"));
  const linhas = r.chapters.output.split("\n");
  ok(linhas.length === 4 && linhas[0].startsWith("0:00 Introdução"), "4 capítulos, o primeiro em 0:00", r.chapters.output);
  ok(r.chapters.problems.length === 0, "capítulos sem problemas", r.chapters.problems.join(" | "));
  // confere um horário com o relógio da simulação
  const alvo = cues.find((c) => c.text.startsWith("Agora começa o primeiro passo"))!;
  const m = linhas[1].match(/^(\d+):(\d{2}) /)!;
  ok(Math.abs(+m[1] * 60 + +m[2] - alvo.start) <= 0.5 + 1e-9, "horário do 2º capítulo = início real do trecho", `${linhas[1]} x ${alvo.start.toFixed(2)}`);
  // velocidade: dividir por 1,2
  const r12 = buildPackage(cues, ROTEIRO, 1.2);
  const m12 = r12.chapters.output.split("\n")[1].match(/^(\d+):(\d{2}) /)!;
  ok(Math.abs(+m12[1] * 60 + +m12[2] - alvo.start / 1.2) <= 0.5 + 1e-9, "velocidade 1,2× encurta os horários");
}

// 4) sem marcas: só legenda; primeira marca depois de 0:00 ganha "Introdução"; trecho pulado não desalinha
{
  const { cues } = simular("Oi, tudo bem? Hoje vamos falar de áudio. Vamos lá!");
  const r = buildPackage(cues, "Oi, tudo bem? Hoje vamos falar de áudio. Vamos lá!", 1);
  ok(r.chapters.marks === 0 && r.chapters.output === "" && r.count >= 1, "sem marcas: só legenda");

  const T = "Primeira parte do vídeo com bastante texto para durar. Segue mais uma frase aqui.\n\nSegundo parágrafo bem comprido, para durar bastante tempo e passar de dez segundos de fala completa.\n\n[CAPÍTULO: Meio]\nTerceiro parágrafo do roteiro, que começa o capítulo do meio e também dura bastante tempo.\n\n[CAPÍTULO: Fim]\nQuarto parágrafo, que começa o capítulo final do roteiro e também precisa durar um pouco mais.";
  const s1 = simular(T);
  const r1 = buildPackage(s1.cues, T, 1);
  ok(r1.chapters.output.split("\n")[0].startsWith("0:00 Introdução"), "marca fora do 0:00 ganha 'Introdução' antes", r1.chapters.output);
  const s2 = simular(T, [1]); // pula o 2º trecho (falha de voz): a legenda e os capítulos continuam coerentes
  const r2 = buildPackage(s2.cues, T, 1);
  ok(r2.count >= 1 && r2.chapters.output.includes("Meio"), "trecho pulado não quebra legenda nem capítulos", r2.chapters.output);
}

console.log(falhas ? `\n${falhas} teste(s) falharam.` : "\nTodos os testes passaram.");
process.exit(falhas ? 1 : 0);
