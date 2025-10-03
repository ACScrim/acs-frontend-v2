<script setup lang="ts">
import { ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
  <div class="max-w-2xl mx-auto p-8 text-center">
    <!-- Titre principal avec gradient Tailwind -->
    <h1
      class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8"
    >
      {{ msg }}
    </h1>

    <!-- Card avec le compteur -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700"
    >
      <button
        type="button"
        @click="count++"
        class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg mb-4"
      >
        Count is {{ count }} 🚀
      </button>

      <p class="text-gray-600 dark:text-gray-300 mb-2">
        Edit
        <code
          class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-purple-600 dark:text-purple-400"
        >
          components/HelloWorld.vue
        </code>
        to test HMR
      </p>
    </div>

    <!-- Section des liens avec des cards stylées -->
    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <div
        class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800"
      >
        <h3
          class="text-lg font-semibold text-green-800 dark:text-green-200 mb-2"
        >
          📚 Documentation
        </h3>
        <p class="text-green-700 dark:text-green-300 mb-3">
          Découvrez la documentation officielle Vue + Vite
        </p>
        <a
          href="https://vuejs.org/guide/quick-start.html#local"
          target="_blank"
          class="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium hover:underline"
        >
          create-vue →
        </a>
      </div>

      <div
        class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
      >
        <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
          🛠️ IDE Support
        </h3>
        <p class="text-blue-700 dark:text-blue-300 mb-3">
          Optimisez votre développement avec les bons outils
        </p>
        <a
          href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
          target="_blank"
          class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium hover:underline"
        >
          Vue Docs →
        </a>
      </div>
    </div>

    <!-- Footer avec style Tailwind -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
      <p
        class="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-2"
      >
        <span>🎨</span>
        Cliquez sur les logos Vite et Vue pour en savoir plus
        <span>✨</span>
      </p>

      <!-- Indicateur que Tailwind fonctionne -->
      <div
        class="mt-4 inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-full text-sm font-medium"
      >
        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        Tailwind CSS is working! 🎉
      </div>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
