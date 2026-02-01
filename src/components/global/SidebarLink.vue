<script setup lang="ts">

import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import {RouterLink} from "vue-router";

defineProps<{
  route?: ReturnType<typeof import("vue-router").useRoute>["matched"][number];
}>();
</script>

<template>
  <RouterLink
    v-if="route"
    :to="route.path"
    class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-foam-200 transition-all duration-300 hover:bg-gradient-to-r hover:from-white/5 hover:to-white/0 border border-transparent hover:border-white/10"
    active-class="bg-gradient-to-r from-accent-500/15 to-blush-500/5 text-white shadow-[0_0_25px_rgba(123,109,255,0.2)] border-accent-400/30"
  >
    <div
      class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/10 text-accent-300 transition-all duration-300 group-hover:from-white/10 group-hover:to-white/15 group-hover:scale-105 group-hover:text-accent-200"
    >
      <VueIcon
        v-if="route.meta.icon"
        :name="route.meta.icon"
        class="size-6"
      />
    </div>
    <div class="flex flex-col flex-1 min-w-0">
      <span class="font-semibold group-hover:text-white transition-colors truncate">{{ route.meta.title || route.name }}<slot name="labelSuffix" /></span>
    </div>
  </RouterLink>
</template>