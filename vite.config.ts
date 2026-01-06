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
        globPatterns: [],           // rien n’est précaché
        runtimeCaching: [
          { urlPattern: /.*/, handler: "NetworkOnly" }, // tout passe par le réseau
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
