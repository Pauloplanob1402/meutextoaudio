// Biblioteca de ideias de vídeo por assunto.
// São ideias de FORMATO que costumam funcionar, escritas à mão. Não é um ranking do que está em alta hoje.
// Para editar ou acrescentar: mexa só neste arquivo. Os trechos entre [colchetes] são para a pessoa trocar.

export type Idea = { format: string; title: string; hook: string };
export type Niche = { id: string; name: string; note?: string; ideas: Idea[] };

export const NICHES: Niche[] = [
  {
    id: "infantil",
    name: "Infantil e família",
    note: "Vídeos feitos para crianças precisam ser marcados como “feito para crianças” no YouTube, e isso limita alguns recursos, como os comentários. Nunca peça dados pessoais das crianças.",
    ideas: [
      { format: "Aprender brincando", title: "Aprenda as cores com balões coloridos", hook: "Comece com uma pergunta simples (de que cor é o céu?) e mostre uma cor de cada vez, repetindo o nome." },
      { format: "Música com gestos", title: "Música dos números de 1 a 10 com palmas", hook: "Comece batendo palmas no ritmo e convide a criança a repetir junto." },
      { format: "Experimento seguro", title: "Faça um vulcão de massinha em casa (com um adulto)", hook: "Mostre o resultado final nos primeiros segundos e depois explique, passo a passo, como chegar lá." },
      { format: "Historinha para dormir", title: "Historinha curta: o dragão que tinha medo do escuro", hook: "Use voz calma e frases curtas. Uma boa história tem começo, problema e solução em poucos minutos." },
      { format: "Dica para os pais", title: "5 brincadeiras sem tela para fazer em 10 minutos", hook: "Fale com os adultos: comece pelo problema (criança entediada) e entregue a solução logo em seguida." },
    ],
  },
  {
    id: "atualidades",
    name: "Atualidades e política",
    note: "Mostre os fatos e as fontes e deixe a conclusão para quem assiste. Conferir a informação antes de publicar protege a credibilidade do seu canal.",
    ideas: [
      { format: "Explicar em 3 minutos", title: "Entenda em 3 minutos como uma lei vira lei", hook: "Comece com a pergunta que todo mundo tem e responda em passos curtos, um de cada vez." },
      { format: "Checagem de boato", title: "Isso que circula no WhatsApp é verdade? Vamos conferir", hook: "Mostre o boato, depois as fontes que você consultou, e só então a conclusão." },
      { format: "Os números da notícia", title: "O que os números dizem sobre [tema]", hook: "Mostre um dado por vez, com a fonte escrita na tela." },
      { format: "Os dois lados", title: "O que dizem quem apoia e quem critica [medida]", hook: "Dê a mesma atenção aos dois lados e diga claramente quem afirmou o quê." },
      { format: "Dicionário do noticiário", title: "7 termos do jornal que ninguém explica", hook: "Escolha termos que aparecem sempre nas notícias e explique cada um com um exemplo do dia a dia." },
    ],
  },
  {
    id: "virais",
    name: "Virais e entretenimento",
    note: "Se usar trechos de vídeos de outras pessoas, confira as regras de direitos autorais antes de publicar.",
    ideas: [
      { format: "Desafio com regra simples", title: "Fiquei 24 horas sem celular", hook: "Diga a regra e o que está em jogo na primeira frase." },
      { format: "Lista com surpresa", title: "5 coisas que você faz errado todo dia", hook: "Comece pela mais surpreendente e deixe a melhor para o fim." },
      { format: "Antes e depois", title: "Transformei o meu quarto gastando pouco", hook: "Mostre o “depois” por 3 segundos logo no começo e volte para explicar como chegou lá." },
      { format: "Um dia na vida", title: "Um dia na vida de quem trabalha com [profissão]", hook: "Mostre o horário na tela e o que ninguém imagina sobre o dia a dia." },
      { format: "Teste entre opções", title: "Testei 3 jeitos de fazer [tarefa]: qual é o melhor?", hook: "Anuncie o vencedor só no final e mostre o critério da comparação desde o começo." },
    ],
  },
  {
    id: "games",
    name: "Games",
    ideas: [
      { format: "Guia para iniciantes", title: "Comece em [jogo] do zero: 7 dicas", hook: "Fale do erro mais comum de quem está começando e mostre como evitá-lo." },
      { format: "Melhores momentos", title: "Os melhores momentos da semana jogando [jogo]", hook: "Abra com o melhor momento e depois mostre os outros em ordem." },
      { format: "Desafio com limitação", title: "Zerei [jogo] só com [limitação]", hook: "Explique a limitação em uma frase e mostre o placar do desafio na tela." },
      { format: "Ajuste de desempenho", title: "As melhores configurações para rodar [jogo] em PC fraco", hook: "Mostre a diferença antes e depois nos números de quadros por segundo." },
      { format: "Comparação", title: "Joguei [jogo] no celular e no PC: qual ganha?", hook: "Compare o mesmo trecho nos dois e deixe o resultado para o final." },
    ],
  },
  {
    id: "educacao",
    name: "Educação e estudos",
    ideas: [
      { format: "Resumo de matéria", title: "[Matéria] em 10 minutos: [assunto]", hook: "Comece com um exemplo do cotidiano antes de falar de fórmula ou regra." },
      { format: "Erros comuns", title: "5 erros que quase todo mundo comete em [assunto]", hook: "Mostre o erro, depois a forma certa, sempre nessa ordem." },
      { format: "Método de estudo", title: "Como estudar [matéria] em 30 minutos por dia", hook: "Mostre um plano pequeno e possível, e não uma rotina impossível." },
      { format: "Passo a passo", title: "Resolvendo uma questão de [prova] passo a passo", hook: "Leia a questão na tela, pause para a pessoa tentar e então mostre a solução." },
      { format: "Rotina de estudos", title: "Minha rotina de estudos de uma semana", hook: "Mostre o que funcionou e também o que você mudou no meio do caminho." },
    ],
  },
  {
    id: "financas",
    name: "Dinheiro e finanças pessoais",
    note: "Explicar é diferente de prometer. Evite garantir ganho ou indicar um investimento como certo, e deixe claro que o conteúdo é educativo.",
    ideas: [
      { format: "Explicar um termo", title: "Juros compostos explicados com um exemplo simples", hook: "Use uma conta pequena na tela, com números fáceis de acompanhar." },
      { format: "Passo a passo", title: "Como montar o seu orçamento do mês em 15 minutos", hook: "Entregue um modelo simples que a pessoa possa copiar no final do vídeo." },
      { format: "Comparar", title: "Cartão de crédito ou débito? Quando cada um faz sentido", hook: "Mostre dois exemplos do dia a dia, um para cada caso." },
      { format: "Erros comuns", title: "5 gastos pequenos que pesam no fim do mês", hook: "Comece pelo gasto que mais surpreende e some o total na tela." },
      { format: "Desafio", title: "Desafio: guardar um valor em 30 dias", hook: "Mostre a regra e o acompanhamento semana a semana, sem prometer resultado." },
    ],
  },
  {
    id: "culinaria",
    name: "Culinária",
    ideas: [
      { format: "Receita rápida", title: "Jantar em 15 minutos com 5 ingredientes", hook: "Mostre o prato pronto no começo e liste os ingredientes na tela." },
      { format: "Aproveitamento", title: "3 receitas com o que sobrou na geladeira", hook: "Comece com a geladeira aberta e a pergunta: o que dá para fazer com isso?" },
      { format: "Teste", title: "Testei 3 jeitos de fazer [prato]: qual é o melhor?", hook: "Mostre os três lado a lado e o critério que você usou para escolher." },
      { format: "Cardápio da semana", title: "Cardápio da semana gastando pouco", hook: "Mostre a lista de compras e o que cada item rende ao longo da semana." },
      { format: "Erros comuns", title: "Por que o seu [prato] não dá certo", hook: "Mostre o erro mais comum em câmera e a correção logo depois." },
    ],
  },
  {
    id: "tecnologia",
    name: "Tecnologia e dicas de celular",
    ideas: [
      { format: "Configurações úteis", title: "7 configurações do celular que você deveria mudar hoje", hook: "Mostre a tela do celular e o caminho exato para cada ajuste." },
      { format: "Tutorial rápido", title: "Como [fazer tarefa] no celular em 2 minutos", hook: "Comece pelo resultado final e depois mostre o passo a passo." },
      { format: "Teste de aplicativos", title: "Qual app é melhor para [tarefa]? Testei 3", hook: "Use a mesma tarefa nos três e diga o critério da comparação." },
      { format: "Segurança", title: "Como saber se uma mensagem é golpe", hook: "Mostre exemplos de mensagem falsa e os sinais que entregam o golpe." },
      { format: "Antes de comprar", title: "O que olhar antes de comprar um celular", hook: "Dê 3 critérios simples e explique por que cada um importa." },
    ],
  },
  {
    id: "bemestar",
    name: "Bem-estar e desenvolvimento pessoal",
    note: "Conte a sua experiência sem prometer resultado e sem substituir a orientação de um profissional de saúde.",
    ideas: [
      { format: "Hábito pequeno", title: "Um hábito de 2 minutos para começar o dia melhor", hook: "Mostre o hábito já na primeira frase e explique como encaixá-lo na rotina." },
      { format: "Rotina em passos", title: "Minha rotina da manhã, passo a passo", hook: "Mostre o horário de cada etapa e diga o que você cortaria se tivesse pouco tempo." },
      { format: "Organizar o tempo", title: "Como organizar a semana em 10 minutos", hook: "Faça o planejamento em tela e entregue um modelo para quem assiste." },
      { format: "Aprendizados de leitura", title: "O que eu aprendi lendo [livro]", hook: "Escolha 3 ideias e conte como você aplicou cada uma." },
      { format: "Desafio de 7 dias", title: "7 dias de [hábito]: o que mudou", hook: "Mostre um pequeno diário dos 7 dias, com o que foi fácil e o que foi difícil." },
    ],
  },
];
