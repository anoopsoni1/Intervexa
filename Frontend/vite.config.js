import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';




export default defineConfig({
  // GSAP ships ESM in index.js but "require" resolves to CJS; when SSG/SSR leaves
  // the package external, Node can load index.js as CJS and throw on `import`.
  ssr: {
    noExternal: ["gsap", /^gsap\//],
  },
  ssgOptions: {
    entry: "src/main.jsx",
    dirStyle: "nested",
    includedRoutes() {
      return ["/", "/about", "/contact", "/price"];
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@monaco-editor")) return "monaco";
          if (id.includes("node_modules/three") || id.includes("node_modules/ogl")) return "graphics";
          if (id.includes("recharts")) return "charts";
          if (id.includes("grapesjs")) return "grapesjs";
          if (id.includes("@craftjs")) return "craftjs";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("socket.io-client")) return "socket";
          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  plugins: [react(), tailwindcss() ,
     VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        // SPA fallback is registered as NavigationRoute → index.html; without this,
        // /sitemap.xml, /robots.txt, etc. get the React app instead of real files.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/(sitemap\.xml|robots\.txt)$/],
         skipWaiting: true,
         clientsClaim: true,
      },
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ansoyal AI - AI Resume Builder & Optimizer',
        short_name: 'Ansoyal AI',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        icons: [
          { src: '/one.png', sizes: '192x192', purpose: 'maskable', type: 'image/png' },
          { src: '/one.png', sizes: '512x512', purpose: 'maskable', type: 'image/png' }
        ]
      }
    })
  ],
})
