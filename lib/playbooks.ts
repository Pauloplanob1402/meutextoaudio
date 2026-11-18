// Biblioteca de playbooks: estruturas de vídeo muito usadas por canais de todos os tamanhos,
// escritas à mão como modelos para preencher. Não são garantia de resultado: testar e ajustar é parte do método.
// Para acrescentar um playbook: copie um item de PLAYBOOKS e troque os textos. As lacunas são {id}.

export type BlockId = "gancho" | "contexto" | "desenvolvimento" | "climax" | "cta";
export type Field = { id: string; label: string; example: string };
export type Playbook = {
  id: string;
  name: string;
  short: string;
  when: string;
  why: string;
  trap: string;
  length: string;
  fields: Field[];
  blocks: Record<BlockId, string>;
};

export const PLAYBOOKS: Playbook[] = [
  {
    id: "promessa-prova", name: "Promessa e prova", short: "O clássico dos vídeos que ensinam: promete, prova e entrega.",
    when: "Vídeos que explicam, ensinam ou resolvem um problema.", why: "A pessoa sabe logo o que ganha, vê que é possível e tem motivo para ficar até o fim.",
    trap: "Prometer mais do que o vídeo entrega. Isso derruba a retenção e a confiança.", length: "5 a 10 minutos",
    fields: [
      { id: "problema", label: "O problema da pessoa (comece com um verbo)", example: "perder horas editando áudio" },
      { id: "resultado", label: "O resultado prometido", example: "áudio limpo em 5 minutos" },
      { id: "prova", label: "Uma prova de que funciona", example: "eu uso isso em todos os meus vídeos há um ano" },
      { id: "p1", label: "Ponto 1", example: "gravar em um lugar silencioso" },
      { id: "p2", label: "Ponto 2", example: "cortar as pausas longas" },
      { id: "p3", label: "Ponto 3", example: "ajustar o volume final" },
    ],
    blocks: {
      gancho: "Você já cansou de {problema}? Veja como chegar a {resultado}.",
      contexto: "{prova}. Neste vídeo eu mostro o passo a passo, do começo ao fim, em 3 pontos: {p1}, {p2} e {p3}.",
      desenvolvimento: "Ponto 1: {p1}.\n\nPonto 2: {p2}.\n\nPonto 3: {p3}.",
      climax: "Com os três pontos juntos, o resultado é {resultado}. Esse é o momento em que tudo se encaixa.",
      cta: "Se isso ajudou, o próximo vídeo continua daqui. Ele está logo ao lado.",
    },
  },
  {
    id: "tutorial", name: "Tutorial passo a passo", short: "Mostrar fazendo, do zero ao resultado, sem enrolação.",
    when: "Ensinar uma tarefa que se faz na tela, na bancada ou no celular.", why: "Quem procura um tutorial quer resolver agora. Ordem clara e resultado visível seguram até o fim.",
    trap: "Começar explicando a teoria. Mostre o resultado primeiro e a explicação depois.", length: "4 a 12 minutos",
    fields: [
      { id: "tarefa", label: "O que a pessoa vai fazer", example: "gravar uma narração em casa" },
      { id: "tempo", label: "Quanto tempo leva", example: "10 minutos" },
      { id: "precisa", label: "O que precisa ter", example: "um celular e um cobertor" },
      { id: "erro", label: "O erro mais comum", example: "gravar com eco de cômodo vazio" },
      { id: "resultado", label: "Como fica no final", example: "uma voz limpa e sem eco" },
    ],
    blocks: {
      gancho: "Veja como fica o resultado: {resultado}. E você faz isso em {tempo}.",
      contexto: "Hoje vou mostrar como {tarefa}. Você só precisa de {precisa}.",
      desenvolvimento: "Passo 1: [descreva o primeiro passo].\n\nPasso 2: [descreva o segundo passo].\n\nPasso 3: [descreva o terceiro passo].\n\nAtenção ao erro mais comum: {erro}.",
      climax: "Pronto! Agora é só conferir: {resultado}.",
      cta: "Se travou em algum passo, comente em qual. Eu respondo.",
    },
  },
  {
    id: "erro-licao", name: "Erro e lição", short: "Conte o que deu errado e o que ficou de aprendizado.",
    when: "Histórias pessoais, bastidores, aprendizados de quem já passou por isso.", why: "Gente se identifica com quem errou. A história prende, e a lição dá utilidade ao vídeo.",
    trap: "Contar só o que aconteceu, sem dizer o que a pessoa pode fazer diferente.", length: "4 a 8 minutos",
    fields: [
      { id: "erro", label: "O erro", example: "publiquei 10 vídeos sem olhar um número de retenção" },
      { id: "custo", label: "O que ele custou", example: "três meses de trabalho sem crescer" },
      { id: "descoberta", label: "O que você descobriu", example: "o público saía nos primeiros 10 segundos" },
      { id: "licao", label: "A lição", example: "o gancho precisa ser a primeira coisa a ser escrita" },
    ],
    blocks: {
      gancho: "Eu {erro}. E isso me custou {custo}.",
      contexto: "Se você está começando, esta história pode te poupar tempo. Vou contar como aconteceu e o que eu mudaria hoje.",
      desenvolvimento: "O que aconteceu: [conte em 3 ou 4 frases curtas].\n\nO momento em que percebi: {descoberta}.\n\nO que eu fiz depois: [conte a mudança].",
      climax: "A lição que eu levo: {licao}.",
      cta: "Já passou por algo parecido? Conte nos comentários.",
    },
  },
  {
    id: "desafio", name: "Desafio ou experimento", short: "“Testei isto por 7 dias”: regra clara, resultado e surpresa.",
    when: "Testar um método, uma ferramenta ou uma ideia na prática.", why: "Um teste com regra clara cria suspense natural: a pessoa quer saber como termina.",
    trap: "Regras vagas. Diga exatamente o que valia e o que não valia.", length: "6 a 12 minutos",
    fields: [
      { id: "desafio", label: "O desafio", example: "publicar um vídeo por dia durante uma semana" },
      { id: "regra", label: "A regra principal", example: "nenhum vídeo com mais de 3 minutos" },
      { id: "resultado", label: "O resultado final", example: "ganhei 40 inscritos e perdi 2 noites de sono" },
      { id: "surpresa", label: "A surpresa", example: "o vídeo mais simples foi o que mais cresceu" },
    ],
    blocks: {
      gancho: "Eu fiz um teste: {desafio}. E o resultado: {resultado}.",
      contexto: "A regra era uma só: {regra}. Vou mostrar o que aconteceu, dia a dia, e o que eu aprendi.",
      desenvolvimento: "Dia 1: [o que aconteceu].\n\nMeio do desafio: [o que mudou].\n\nÚltimo dia: [como terminou].",
      climax: "E a maior surpresa: {surpresa}.",
      cta: "Quer que eu teste outra coisa? Diga nos comentários o que você quer ver.",
    },
  },
  {
    id: "lista", name: "Lista numerada", short: "Os melhores, os piores ou os essenciais, em uma ordem que prende.",
    when: "Dicas, ferramentas, erros, curiosidades, recomendações.", why: "O número promete um fim e organiza a atenção. A pessoa sabe quanto falta.",
    trap: "Itens fracos no meio. Deixe o melhor para o final, mas faça o primeiro ser bom.", length: "5 a 10 minutos",
    fields: [
      { id: "tema", label: "O tema da lista", example: "erros de quem começa no YouTube" },
      { id: "n", label: "Quantos itens", example: "5" },
      { id: "melhor", label: "O item mais forte (fica por último)", example: "não saber para quem o vídeo é" },
      { id: "bonus", label: "Um bônus", example: "a pergunta que eu faço antes de gravar" },
    ],
    blocks: {
      gancho: "{n} {tema}. O último é o que mais derruba vídeo, e quase ninguém percebe.",
      contexto: "Vou do mais simples ao mais importante. Se você já cometeu algum, não se preocupe: todo mundo começa assim.",
      desenvolvimento: "Número {n}, em ordem decrescente:\n[item]: [por que acontece e como resolver].\n\n(Repita para cada item.)",
      climax: "E o primeiro da lista: {melhor}.",
      cta: "Bônus: {bonus}. Qual item foi o mais difícil para você? Comente o número.",
    },
  },
  {
    id: "antes-depois", name: "Antes e depois", short: "Mostre a transformação e o caminho entre os dois pontos.",
    when: "Reformas, melhorias, resultados de um método ao longo do tempo.", why: "O contraste entre dois estados é visual, simples e dá vontade de saber como chegar lá.",
    trap: "Não mostrar o “antes” de verdade. Sem contraste honesto, perde a graça e a confiança.", length: "4 a 8 minutos",
    fields: [
      { id: "antes", label: "Como era antes", example: "meu canal tinha 12 inscritos e 30 visualizações por vídeo" },
      { id: "depois", label: "Como ficou depois", example: "chegou a 500 inscritos e 800 visualizações por vídeo" },
      { id: "tempo", label: "Em quanto tempo", example: "90 dias" },
      { id: "mudanca", label: "A mudança que fez a diferença", example: "passar a escrever o gancho primeiro" },
    ],
    blocks: {
      gancho: "Antes: {antes}. Depois: {depois}. E levou {tempo}.",
      contexto: "Neste vídeo eu mostro o que mudou entre um ponto e o outro, sem atalho e sem segredo.",
      desenvolvimento: "O ponto de partida: [descreva com honestidade].\n\nO que eu mudei: [liste as mudanças].\n\nO que não funcionou: [conte também].",
      climax: "A mudança que fez a diferença: {mudanca}.",
      cta: "Se você quer começar a sua mudança hoje, o primeiro passo está no próximo vídeo.",
    },
  },
  {
    id: "mitos", name: "Mitos e verdades", short: "Derrube crenças comuns, uma de cada vez.",
    when: "Assuntos cheios de achismo, dicas contraditórias ou promessas fáceis.", why: "Contrariar o que todo mundo acha gera curiosidade, e cada mito derrubado dá uma pequena vitória.",
    trap: "Dizer que é mito sem mostrar por quê. Dê o motivo ou a fonte.", length: "5 a 9 minutos",
    fields: [
      { id: "tema", label: "O tema", example: "crescer no YouTube" },
      { id: "mito", label: "O mito mais popular", example: "é preciso postar todo dia" },
      { id: "verdade", label: "A verdade", example: "o que cresce é a constância possível, com qualidade" },
      { id: "fonte", label: "De onde vem a sua informação", example: "dados do meu próprio canal" },
    ],
    blocks: {
      gancho: "Todo mundo diz que {mito}. Só que isso está errado.",
      contexto: "Neste vídeo eu desmonto os mitos mais comuns sobre {tema}. A fonte do que eu mostro: {fonte}.",
      desenvolvimento: "Mito 1: {mito}.\nA verdade: {verdade}.\n\nMito 2: [escreva o mito].\nA verdade: [escreva a verdade].\n\nMito 3: [escreva o mito].\nA verdade: [escreva a verdade].",
      climax: "O mito que mais atrapalha é o primeiro. A verdade: {verdade}.",
      cta: "Qual mito você ainda ouve por aí? Comente, e o próximo vídeo pode ser sobre ele.",
    },
  },
  {
    id: "comparativo", name: "Comparativo com veredito", short: "Compare as opções e diga qual escolheria, e por quê.",
    when: "Ferramentas, métodos, produtos ou caminhos que as pessoas confundem.", why: "A pessoa quer decidir. Um veredito claro, com critério, vale mais que uma lista de prós e contras.",
    trap: "Ficar em cima do muro. Diga a sua escolha e para quem ela serve.", length: "6 a 12 minutos",
    fields: [
      { id: "a", label: "Opção A", example: "gravar a própria voz" },
      { id: "b", label: "Opção B", example: "usar texto em áudio" },
      { id: "criterio", label: "O critério mais importante", example: "tempo gasto por vídeo" },
      { id: "veredito", label: "O seu veredito", example: "texto em áudio para começar, voz própria quando o canal crescer" },
    ],
    blocks: {
      gancho: "{a} ou {b}? No final deste vídeo eu dou o meu veredito.",
      contexto: "Vou comparar os dois com um critério simples. O mais importante é: {criterio}.",
      desenvolvimento: "{a}: [pontos fortes e fracos].\n\n{b}: [pontos fortes e fracos].\n\nNa prática: [um exemplo que mostre a diferença].",
      climax: "O meu veredito: {veredito}.",
      cta: "E você, qual escolheria? Conte nos comentários.",
    },
  },
];

export const BLOCK_IDS: BlockId[] = ["gancho", "contexto", "desenvolvimento", "climax", "cta"];

// Troca {campo} pelo valor digitado, ou por [rótulo] se ainda estiver vazio
export function fillTemplate(tpl: string, fields: Field[], values: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_m, id: string) => {
    const f = fields.find((x) => x.id === id);
    const v = (values[id] ?? "").trim();
    return v || `[${f ? f.label.toLowerCase() : id}]`;
  });
}

export function composeBlocks(p: Playbook, values: Record<string, string>): Record<BlockId, string> {
  const out = {} as Record<BlockId, string>;
  // primeira letra maiúscula no começo de cada parágrafo
  const up = (t: string) => t.replace(/(^|\n\n)(\p{Ll})/gu, (_m, a: string, c: string) => a + c.toUpperCase());
  for (const b of BLOCK_IDS) out[b] = up(fillTemplate(p.blocks[b], p.fields, values));
  return out;
}

export const filledCount = (p: Playbook, values: Record<string, string>) => p.fields.filter((f) => (values[f.id] ?? "").trim()).length;
