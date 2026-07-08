import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import PrerenderSPAPlugin from "@prerenderer/rollup-plugin";

// Rotas pré-renderizadas em build para que crawlers sem JS
// (Facebook, LinkedIn, WhatsApp) leiam OG/Twitter por idioma.
const PRERENDER_ROUTES = ["/", "/privacidade", "/en", "/en/privacy"];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode !== "development" &&
      PrerenderSPAPlugin({
        routes: PRERENDER_ROUTES,
        renderer: "@prerenderer/renderer-puppeteer",
        rendererOptions: {
          // Aguarda o Helmet mutar o <head> antes de serializar
          renderAfterTime: 1500,
          maxConcurrentRoutes: 2,
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
        // Mantém o index.html original também: cada rota gera <route>/index.html
        postProcess(renderedRoute: { route: string; html: string }) {
          const isEn = renderedRoute.route.startsWith("/en");
          renderedRoute.html = renderedRoute.html.replace(
            /<html[^>]*>/,
            `<html lang="${isEn ? "en" : "pt-BR"}">`,
          );
        },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
