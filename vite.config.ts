import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
// @ts-ignore
import VueIconsPlugin from '@kalimahapps/vue-icons/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), VueIconsPlugin()],
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
    chunkSizeWarningLimit: 1000,
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
