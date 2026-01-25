<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useThreeBoxesStore } from '@/stores/threeBoxesStore';
import { Button, Card } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const store = useThreeBoxesStore();
const selected = ref<number | null>(null);
const showResult = ref(false);

onMounted(() => {
  store.loadToday();
});

const choose = async (n: number) => {
  if (store.played || store.loading) return;
  try {
    await store.chooseBox(n);
    selected.value = store.choice;
    showResult.value = true;
  } catch (e) {
    // error handled in store
  }
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-azure-400 to-accent-400 bg-clip-text text-transparent">
        Les 3 boîtes
      </h1>
      <p class="text-foam-300">Choisissez une boîte — 1 essai par jour</p>
    </div>

    <!-- Game card -->
    <Card class="p-8 backdrop-blur-xl border border-foam-200/10 rounded-2xl">
      <div v-if="store.loading" class="text-center py-12">Chargement...</div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div v-for="n in [1,2,3]" :key="n" class="flex flex-col items-center">
          <button
            class="w-44 h-44 rounded-2xl flex flex-col items-center justify-center transition-transform transform hover:scale-105 shadow-lg"
            :class="[
              store.played ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
              selected && selected === n ? 'ring-4 ring-emerald-400/30' : 'bg-gradient-to-br from-surface-700/60 to-surface-800/40'
            ]"
            :disabled="store.played"
            @click="choose(n)"
          >
            <div class="flex items-center gap-2">
              <VueIcon name="md:inventory" class="text-azure-300" size="36" />
            </div>
            <span v-if="!store.played" class="mt-3 text-lg font-semibold text-white">Boîte {{ n }}</span>
            <span v-else-if="store.permutation" class="mt-3 text-lg font-semibold text-white">{{ store.permutation[n-1] }}<img src="/scrimium.svg" alt="Scrimium" width="20" height="20" class="inline ml-1" /></span>
          </button>

          <div class="mt-3 w-full">
            <Button :disabled="store.played" class="w-full" @click="choose(n)">
              <span v-if="!store.played">Choisir</span>
              <span v-else-if="store.choice === n">Choisie</span>
              <span v-else>Non choisie</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Résultat -->
      <div v-if="store.played || showResult" class="mt-8 bg-surface-700/50 border border-foam-200/10 rounded-xl p-6">
        <div class="flex items-center gap-4">
          <VueIcon v-if="store.reward && store.reward > 0" name="md:sharp-check-circle" class="text-emerald-400" size="28" />
          <VueIcon v-else name="md:sentiment-dissatisfied" class="text-amber-400" size="28" />

          <div>
            <h3 :class="['text-lg font-semibold', store.reward && store.reward > 0 ? 'text-emerald-300' : 'text-foam-300']">
              {{ store.reward && store.reward > 0 ? `Bravo — +${store.reward} scrimiums !` : "Dommage, vous n'avez rien gagné aujourd'hui." }}
            </h3>
            <p class="text-foam-300 text-sm mt-1">Revenez demain pour un nouvel essai.</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
