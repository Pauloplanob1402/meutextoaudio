# Cópia local de `pocket-tts-js` 0.1.0 (MIT)

Origem: https://github.com/vlapky/pocket-tts-js (licença MIT, em `LICENSE`).
Por que está aqui e não em `node_modules`: o empacotador do Next (Turbopack) não aceita o `import()` dinâmico
do motor de execução dentro do worker. A única mudança é a linha do `import(...)` em `worker.js`, que ganhou os
comentários `webpackIgnore` e `turbopackIgnore`. Segunda mudança (27/11/2026): `LSD_STEPS` e `TEMPERATURE` deixaram de ser constantes e passam a vir das opções `lsdSteps` e `temperature` (padrões iguais aos originais: 1 e 0,7). O resto é igual ao original.

Os pesos do modelo Pocket TTS (baixados em tempo de execução) são © Kyutai, licença CC BY 4.0.

Terceira mudança (27/11/2026): o worker deixou de ser criado com `new Worker(new URL("./worker.js", import.meta.url))` (o Turbopack o
transformava em um carregador que falhou no site publicado: "importScripts ... failed to load"). Agora `worker.js`, `tokenizer.js` e
`binary.js` são copiados por `scripts/copiar-worker-voz.mjs` (roda sozinho no `predev` e no `prebuild`) para `public/pocket-tts/`, e o
`index.js` abre o worker por um worker "blob" que importa `/pocket-tts/worker.js`. Ao mudar `worker.js`, mude aqui (a cópia em `public/` é refeita no build)
e aumente o `?v=` em `workerUrl` (padrão no `index.js`) para o navegador não usar a cópia antiga.
