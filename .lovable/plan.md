## Objetivo

Gerar HTML estático para 4 rotas — `/`, `/privacidade`, `/en`, `/en/privacy` — de forma que Facebook, LinkedIn, WhatsApp e outros crawlers sem JS leiam `<title>`, `<meta name="description">`, Open Graph e Twitter Card já no HTML servido, sem depender do fallback do `index.html`.

O projeto continua sendo SPA em runtime (React Router + Helmet). O prerender apenas produz snapshots HTML por rota no build.

## Estratégia técnica

Adicionar prerender estático no build usando `@prerenderer/rollup-plugin` + `@prerenderer/renderer-puppeteer` (mesma base do antigo `prerender-spa-plugin`, mantida e compatível com Vite/Rollup). É a alternativa mais estável para React SPA com `react-helmet-async` — o Helmet escreve as tags no `document.head` durante a renderização headless, e o plugin serializa o HTML final por rota.

### Rotas EN

Hoje o React Router só tem `/` e `/privacidade` (mais `/privacy` como alias). Vou adicionar rotas explícitas em inglês:

- `/` → PT-BR (Index)
- `/en` → mesma Index, força `i18n.changeLanguage("en")`
- `/privacidade` → Privacy PT-BR
- `/en/privacy` → Privacy EM

Um pequeno componente `LocaleRoute` seta o idioma via `useEffect` com base no `path`. O `SEO.tsx` já é i18n-aware, então as tags OG saem no idioma certo automaticamente. Vou também atualizar `enPath`/`ptPath` no `SEO` para apontar entre pares reais (`/` ↔ `/en`, `/privacidade` ↔ `/en/privacy`) — isso corrige o `hreflang` e o `og:url` por idioma.

### Fluxo de build

1. `vite build` gera SPA normal em `dist/`.
2. Plugin de prerender sobe um Puppeteer headless, carrega cada rota contra o `dist/index.html`, aguarda o Helmet aplicar (`renderAfterDocumentEvent` ou timeout curto), e grava:
   - `dist/index.html` (rota `/`)
   - `dist/privacidade/index.html`
   - `dist/en/index.html`
   - `dist/en/privacy/index.html`
3. Cada arquivo carrega o mesmo bundle JS, então após hidratar a SPA funciona normalmente. Crawlers sem JS enxergam o HTML pré-renderizado com OG/Twitter corretos.

### Ajustes no `SEO.tsx`

- Passar `enPath`/`ptPath` explícitos em cada página (Index e Privacy) para o hreflang cruzar rotas de idiomas corretamente.
- Garantir que `og:url` e `canonical` refletem a rota atual real (já faz), e que o `og:locale` está correto (já faz).

### Hosting (Vercel)

O `vercel.json` atual reescreve tudo para `/index.html`, o que quebraria o prerender (todas as rotas serviriam o HTML da home). Vou trocar para uma config que:

1. Serve o arquivo estático se ele existir (`/en` → `dist/en/index.html`).
2. Só cai no `index.html` da raiz como último recurso para rotas dinâmicas não pré-renderizadas (ex.: `/admin`).

Usando `cleanUrls: true` e removendo o rewrite global, deixando apenas um fallback via `rewrites` que **não** captura paths com arquivo real.

### Estrutura de arquivos alterada

```text
package.json                        + dependências do prerender
vite.config.ts                      + plugin @prerenderer/rollup-plugin
vercel.json                         reescrito para preservar arquivos estáticos
src/App.tsx                         + rotas /en e /en/privacy + LocaleRoute
src/components/ls/LocaleRoute.tsx   NOVO — força idioma pelo path
src/pages/Index.tsx                 + enPath/ptPath no SEO
src/pages/Privacy.tsx               + enPath/ptPath no SEO
```

## Limitações honestas

- **Puppeteer no build**: adiciona ~150MB de dependência de dev e ~10-30s no tempo de build. Roda apenas em `vite build`, não em dev.
- **Rotas dinâmicas** (ex.: `/admin`, `/admin/login`) continuam SPA puro — não interessam para SEO/OG.
- **Cache de crawlers**: Facebook/LinkedIn cacheiam previews. Depois de publicar, será necessário forçar refresh nos debuggers (Facebook Sharing Debugger, LinkedIn Post Inspector) para ver o novo HTML.
- **Netlify vs Vercel**: a config incluída é para Vercel. Se o deploy for Netlify, o `_redirects` precisa ser diferente — me avise qual host antes de eu publicar.

## Validação após implementação

1. `bun run build` local → conferir se `dist/en/index.html` e `dist/en/privacy/index.html` existem com `og:locale=en_US` no HTML.
2. `dist/privacidade/index.html` com `og:locale=pt_BR` e descrição PT.
3. Rodar `curl -A "facebookexternalhit/1.1" https://.../en` após deploy e confirmar que as tags OG vêm em inglês sem executar JS.
