# Cópia local de `pocket-tts-js` 0.1.0 (MIT)

Origem: https://github.com/vlapky/pocket-tts-js (licença MIT, em `LICENSE`).
Por que está aqui e não em `node_modules`: o empacotador do Next (Turbopack) não aceita o `import()` dinâmico
do motor de execução dentro do worker. A única mudança é a linha do `import(...)` em `worker.js`, que ganhou os
comentários `webpackIgnore` e `turbopackIgnore`. O resto é igual ao original.

Os pesos do modelo Pocket TTS (baixados em tempo de execução) são © Kyutai, licença CC BY 4.0.
