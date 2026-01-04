import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
// @ts-ignore
import VueIconsPlugin from '@kalimahapps/vue-icons/vite'
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VueIconsPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      injectRegister: "script-defer",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,mp4}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB au lieu de 2 MB par défaut
        // Exclure les routes d'authentification du cache
        navigateFallbackDenylist: [
          /^\/api\//, // Toutes les routes API
          /\/auth\//, // Routes d'authentification
          /\/discord\/callback/, // Callback Discord spécifiquement
        ],
        // Exclure du précaching
        globIgnores: ["**/api/**", "**/auth/**"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/acscrim\.fr\/api\/.*/,
            handler: "NetworkOnly", // Jamais de cache pour l'API
          },
          {
            urlPattern: /^https:\/\/v2\.acscrim\.fr\/api\/.*/,
            handler: "NetworkOnly", // Jamais de cache pour l'API
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
              },
            },
          },
        ],
      },
      manifest: {
        name: "ACS Gaming Community",
        short_name: "ACS Gaming",
        description:
          "Application de gestion de tournois gaming pour la communauté ACS",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/Logo_ACS.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/Logo_ACS.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        shortcuts: [
          {
            name: "Tournois à venir",
            short_name: "Tournois",
            description: "Voir les prochains tournois",
            url: "/tournaments",
            icons: [{ src: "/Logo_ACS.png", sizes: "96x96" }],
          },
          {
            name: "Classement",
            short_name: "Classement",
            description: "Voir le classement actuel",
            url: "/leaderboard",
            icons: [{ src: "/Logo_ACS.png", sizes: "96x96" }],
          },
        ],
        categories: ["gaming", "competition", "fun", "chill"],
      }
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    // Enable build optimizations
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['@vueuse/core', '@vueuse/motion', '@vueuse/head'],
          'vendor-utils': ['axios', 'dexie'],
        },
      },
    },
    
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 500,
  },
  
  // Enable performance optimizations
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@vueuse/core',
    ],
  },
});
