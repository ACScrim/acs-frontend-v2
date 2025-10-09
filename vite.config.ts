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
});
