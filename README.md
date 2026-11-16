# texto-áudio

Site que transforma texto em áudio em português do Brasil, direto no navegador (voz Piper `pt_BR-faber-medium`).
O texto não sai do aparelho e não há custo por uso.

## Rodar no seu computador

```
npm install
npm run dev
```

Abra http://localhost:3000 no Chrome ou Edge. Na primeira geração o navegador baixa a voz (uns 60 MB).

Se o `npm install` der o erro `getaddrinfo ENOENT` no Windows, rode antes (na mesma janela do CMD):

```
set NODE_OPTIONS=--dns-result-order=ipv4first
```

## Publicar (GitHub + Vercel)

1. Crie um repositório no GitHub e envie os arquivos desta pasta (sem `node_modules` nem `.next`, que já estão no `.gitignore`).
2. Na Vercel: **Add New, Project**, escolha o repositório e clique em **Deploy**. Não precisa configurar nada.
3. Domínio: no projeto da Vercel, **Settings, Domains**, e siga as instruções de DNS.

## Hospedar a voz por conta própria (opcional)

Por padrão, o navegador do visitante baixa a voz do Hugging Face e os arquivos de apoio do cdnjs e do jsDelivr (hospedagens públicas e gratuitas). Funciona bem para começar. Para não depender delas, dá para servir tudo do seu próprio site:

1. Rode uma vez no seu computador (precisa de internet):
   ```
   npm run self-host
   ```
   Isso cria `public/piper`, `public/ort` e `public/voices` (uns 80 MB no total, sendo a voz o maior arquivo, perto de 60 MB).
2. Crie um arquivo `.env.local` com esta linha (e configure a mesma variável na Vercel, em **Settings, Environment Variables**):
   ```
   NEXT_PUBLIC_SELF_HOST=1
   ```
3. Rode `npm run dev`, abra o site, e confirme na aba **Rede** (F12) que nada é baixado de `huggingface.co`, `cdnjs.cloudflare.com` ou `cdn.jsdelivr.net`.
4. Envie a pasta `public/` para o GitHub junto com o resto. O arquivo da voz passa de 50 MB, e o GitHub avisa, mas aceita (o limite é 100 MB por arquivo).

Antes de ligar, saiba que cada visitante novo baixa uns 60 MB do **seu** site. Confira o limite de tráfego do seu plano na Vercel (e se o plano gratuito permite uso comercial, caso você venha a cobrar). Se o tráfego crescer, o caminho comum é colocar esses arquivos num armazenamento de arquivos com tráfego barato (por exemplo, Cloudflare R2) e apontar para ele.

**Versão do onnxruntime-web**: o `package.json` fixa `onnxruntime-web` em `1.18.0` de propósito. A biblioteca de voz carrega arquivos dessa versão, e uma versão mais nova do pacote pode não combinar com eles. Não atualize sem testar.

## Estrutura

- `app/page.tsx`: página (cabeçalho, seções, planos, perguntas)
- `components/Tool.tsx`: a ferramenta (texto, geração, player, download)
- `lib/tts.ts`: limpeza do texto, pausas `[PAUSA - X segundos]`, montagem do WAV e estimativa de duração (`WORDS_PER_MINUTE`)
- `lib/stretch.ts`: ajuste de velocidade do arquivo baixado sem mudar o tom
- `lib/mp3.ts`: converte o WAV em MP3 no navegador (biblioteca `@breezystack/lamejs`). A qualidade fica em `MP3_KBPS` (96 por padrão)
- `app/globals.css`: todo o visual
- `app/ferramentas.css`: o visual das páginas de ferramentas
- `app/ferramentas/`: a página com todas as ferramentas e uma página para cada uma
- `components/tools/`: uma tela por ferramenta (e `ToolView.tsx`, que liga cada endereço à sua tela)
- `lib/tools.ts`: a lista das ferramentas (nome, frase, grupo)
- `lib/ideas.ts`: as ideias de vídeo por assunto (edite aqui para mudar ou acrescentar)
- `lib/toolkit.ts`: os cálculos das ferramentas (hashtags, capítulos, legendas, remover silêncio)
- `next.config.ts` e `empty.ts`: necessários, porque a biblioteca de voz tem um trecho para Node (`fs`, `path`) que não roda no navegador

## O que ainda NÃO está feito

- **Login (Supabase), assinatura e Mercado Pago**: não existem. O plano Pro aparece como "Em breve".
- **Termos de uso e Política de privacidade**: não há páginas. Crie antes de divulgar.
- **Licença da voz**: confirme o uso comercial de `pt_BR-faber-medium` antes de cobrar por qualquer coisa.
- **Exemplos de áudio na página**: foram retirados. Quando tiver os MP3, coloque em `public/audios` e adicione a seção.
- **PWA** (site instalável), imagem de compartilhamento e analytics.
- **Teste real da geração**: o projeto compila e a página abre, mas a geração de áudio não foi testada de ponta a ponta. Teste com um texto longo, em computador e celular.

## Limites conhecidos

- A geração roda no aparelho. Celulares mais fracos podem falhar com textos muito longos. O app pula o trecho que falhar e avisa.
- O arquivo baixado é MP3 (padrão) ou WAV, na velocidade escolhida (ajuste feito no navegador por `lib/stretch.ts`, sem mudar o tom). Para mudanças pequenas costuma soar bem, mas ajustes grandes podem deixar a voz menos natural. Há também o link "Baixar na velocidade original". Se a conversão para MP3 falhar, o app baixa o WAV e avisa.
- A duração mostrada abaixo da caixa de texto é uma **estimativa** (palavras por minuto mais as pausas). Depois de testar com um texto real, compare com o áudio gerado e ajuste `WORDS_PER_MINUTE` em `lib/tts.ts` se precisar.

## Ferramentas extras

Ficam em `/ferramentas`, com um link discreto no menu, abaixo da caixa de texto e no rodapé da página inicial. Todas rodam no navegador, sem servidor e sem custo por uso:

ideias de vídeo por assunto, tempo de fala, dividir texto em blocos, remover silêncio do áudio, título e descrição, hashtags e tags, capítulos, legendas (.srt), checklist de publicação, redimensionar imagem, criar miniatura, calendário de conteúdo (do mês) e calculadora de ganhos.

Para adicionar uma ferramenta nova:

1. Crie a tela em `components/tools/NomeDaFerramenta.tsx`.
2. Registre o endereço em `components/tools/ToolView.tsx`.
3. Inclua o nome e a frase em `lib/tools.ts`. O cartão aparece sozinho na página de ferramentas.

Checklist e calendário salvam no `localStorage` do navegador de cada pessoa. A calculadora de ganhos usa valores de exemplo (RPM 2, 5 e 10): troque pelos valores reais do seu YouTube Studio.
