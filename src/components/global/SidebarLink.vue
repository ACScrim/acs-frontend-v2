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
    class="group flex items-center gap-3 rounded-2xl px-4 py-3 text-foam-200 transition hover:bg-white/5"
    active-class="bg-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
  >
    <div
      class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-accent-300 transition group-hover:bg-white/10 group-hover:text-accent-200"
    >
      <VueIcon
        v-if="route.meta.icon"
        :name="route.meta.icon"
        class="size-5"
      />
    </div>
    <div class="flex flex-col">
      <span class="font-semibold">{{ route.meta.title || route.name }}<slot name="labelSuffix" /></span>
    </div>
  </RouterLink>
</template>