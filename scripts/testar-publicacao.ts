// Testes do Pacote de publicação (sem navegador). Rode com:  npx tsx scripts/testar-publicacao.ts
import { readFileSync } from "node:fs";
import { buildPublicacao, withChapters, DESC_LIMIT } from "../lib/publicacao";

let falhas = 0;
const ok = (c: boolean, n: string, extra = "") => { if (!c) falhas++; console.log(`${c ? "OK   " : "FALHOU"} ${n}${c ? "" : "  -> " + extra}`); };

const roteiro = readFileSync(new URL("../docs/roteiro-de-teste.txt", import.meta.url), "utf8");
const longo = "Hoje eu vou mostrar como gravar narração em casa sem gastar com equipamento. Muita gente acha que precisa de microfone caro, mas não precisa. " +
  "Primeiro, escolha um lugar silencioso e com pouco eco, como um armário com roupas. Depois, grave um teste curto e ouça com fone de ouvido. " +
  "Terceiro, mantenha a distância do microfone constante e evite falar muito rápido. A narração em casa fica boa quando você repete o processo todo vídeo. " +
  "Por fim, salve o arquivo e compare a narração com a de outros canais. Se gostou, inscreva-se no canal e conte nos comentários qual dica ajudou mais.";
const CAP = "0:00 Introdução\n0:15 Primeiro passo\n0:30 Segundo passo\n0:45 Conclusão";

{
  const p = buildPublicacao(longo, CAP, { channel: "Canal do João", cta: "", link: "https://exemplo.com" });
  ok(!!p, "roteiro com texto gera o pacote");
  if (p) {
    ok(p.titles.length >= 1 && p.titles.every((t) => t.text.length > 5), "há títulos para testar", JSON.stringify(p.titles));
    ok(p.descriptions.length === p.titles.length, "uma descrição para cada título");
    const d = p.descriptions[0];
    ok(d.includes("Capítulos:\n0:00 Introdução") && d.includes("0:45 Conclusão"), "descrição traz os capítulos");
    ok(d.indexOf("Capítulos:") < d.indexOf("Inscreva-se no Canal do João"), "capítulos vêm antes do convite");
    ok(d.includes("https://exemplo.com"), "descrição traz o link");
    ok(d.length <= DESC_LIMIT, "descrição dentro do limite do YouTube", String(d.length));
    ok(p.hashtags.length >= 1 && p.hashtags.length <= 5 && p.hashtags.every((h) => h.startsWith("#")), "hashtags válidas", p.hashtags.join(" "));
    ok(p.pinned.includes("Os capítulos estão na descrição."), "comentário fixado cita os capítulos");
    ok(!d.includes("[CAP"), "nenhuma marca [CAPÍTULO] vaza para a descrição");
  }
}
{
  const p = buildPublicacao(roteiro, "", { channel: "", cta: "", link: "" });
  ok(!!p, "roteiro de teste do Sauim gera o pacote");
  if (p) {
    ok(!p.descriptions[0].includes("Capítulos:"), "sem capítulos válidos, a descrição não tem bloco de capítulos");
    ok(!p.pinned.includes("capítulos"), "comentário fixado não cita capítulos que não existem");
    ok(!p.descriptions[0].includes("[CAP"), "marcas de capítulo não vazam");
  }
}
{
  const p = buildPublicacao(longo, CAP, { channel: "", cta: "", link: "", subject: "narração em casa" });
  ok(!!p && p.titles.some((x) => x.text.toLowerCase().includes("narração em casa")), "o assunto digitado aparece nos títulos", p ? p.titles.map((x) => x.text).join(" | ") : "");
}
ok(buildPublicacao("Oi.", CAP, { channel: "", cta: "", link: "" }) === null, "texto curto demais não gera pacote");
ok(withChapters("a\n\nb", "", "x") === "a\n\nb", "sem capítulos o texto não muda");
console.log(falhas ? `\n${falhas} teste(s) falharam.` : "\nTodos os testes passaram.");
process.exit(falhas ? 1 : 0);
