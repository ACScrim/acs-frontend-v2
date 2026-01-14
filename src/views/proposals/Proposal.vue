<script setup lang="ts">
import { PageHeader} from '@/components/global';
import ListView from '@/components/global/ListView.vue';
import LoaderACS from '@/components/global/LoaderACS.vue';
import ProposalCard from '@/components/global/ProposalCard.vue';
import { Button, AcsSelect } from '@/components/ui';
import SelectSearch from '@/components/ui/SelectSearch.vue';
import useProposalStore from '@/stores/proposalStore';
import { useToastStore } from '@/stores/toastStore';
import type { RawgGame } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { whenever } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';

const toastStore = useToastStore();
const proposalStore = useProposalStore();
const proposals = computed(() => proposalStore.proposals);

const filter = ref<'recent' | 'old' | 'popular'>('recent');
const showAddProposalForm = ref(false);
const selectedGameId = ref<string | undefined>(undefined);
const form = ref<{ gameQuery: string, game: RawgGame | null; description: string }>({ gameQuery: '', game: null, description: '' });
const timer = ref<number | null>(null);

onMounted(() => {
  proposalStore.fetchProposals();
});

whenever(filter, () => {
  proposalStore.sortProposals(filter.value);
})

watch(() => form.value.gameQuery, (newQuery) => {
  if (timer.value) clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    if (newQuery.length >= 3) {
      proposalStore.fetchRawgGames(newQuery);
    }
  }, 500);
})

whenever(selectedGameId, () => {
  const game = proposalStore.rawgGames.find(g => String(g.id) === selectedGameId.value) || null;
  form.value.game = game;
});

const handleSubmit = async () => {
  if (!form.value.game) {
    toastStore.error('Veuillez sélectionner un jeu valide.');
    return;
  };

  // Récupérer la description de la proposition
  const description = form.value.description.trim();

  // Soumettre la proposition
  await proposalStore.submitProposal(form.value.game, description);

  // Réinitialiser le formulaire
  resetForm();
}

const resetForm = () => {
  form.value = { gameQuery: '', game: null, description: '' };
  selectedGameId.value = undefined;
  showAddProposalForm.value = false;
}
</script>

<template>
  <section class="space-y-10">
    <PageHeader title="Propositions de jeux" subtitle="Idées de la communauté">
      <template #icon>
        <VueIcon name="bx:upvote" class="text-3xl text-accent-300" />
      </template>
      <template #actions>
        <AcsSelect
          id="proposalFilter"
          v-model="filter"
          :options="[{ value: 'recent', label: 'Plus récents' }, { value: 'old', label: 'Plus anciens' }, { value: 'popular', label: 'Le plus de votes' }]"
          class="min-w-[220px]"
        />
      </template>

      <div class="mt-6 flex flex-col gap-4">
        <Button class="w-fit" @click="showAddProposalForm = true" v-if="!showAddProposalForm">Ajouter une proposition</Button>
        <form v-if="showAddProposalForm" @reset.prevent="resetForm" @submit.prevent="handleSubmit" class="glass-panel space-y-4 p-5">
          <div>
            <label for="gameSelect" class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Rechercher un jeu</label>
            <SelectSearch
              id="gameSelect"
              v-model="selectedGameId"
              :options="proposalStore.rawgGames.map(game => ({
                value: String(game.id),
                label: game.name,
                background_image: game.background_image,
                release_date: game.release_date
              }))"
              :is-loading="proposalStore.isLoading"
              placeholder="Tapez au moins 3 caractères..."
              @search="form.gameQuery = $event"
              :searchable="true"
            >
              <template #item="{ option, isSelected, onSelect }">
                <button
                  type="button"
                  @click="onSelect(option.value)"
                  :class="[
                    'w-full px-4 py-3 text-left transition-colors flex items-center justify-between border-b border-white/5 last:border-b-0',
                    isSelected ? 'bg-white/10 text-white' : 'text-foam-200/80 hover:bg-white/5'
                  ]"
                >
                  <div class="flex items-center gap-4">
                    <img v-if="option.background_image" :src="option.background_image" alt="" class="size-12 rounded-lg object-cover" />
                    <div>
                      <p class="font-semibold">{{ option.label }}</p>
                      <p v-if="option.release_date" class="text-xs text-foam-300/70">Sortie : {{ option.release_date }}</p>
                    </div>
                  </div>
                  <VueIcon v-if="isSelected" name="bs:check-circle-fill" class="text-accent-300" />
                </button>
              </template>
            </SelectSearch>
          </div>
          <div class="relative">
            <textarea
              rows="4"
              maxlength="150"
              placeholder="Expliquez pourquoi vous proposez ce jeu..."
              class="w-full rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 text-white placeholder:text-foam-300/60"
              v-model="form.description"
            />
            <span class="absolute bottom-2 right-2 text-foam-300">{{ form.description.length }} / 150</span>
          </div>
          <div class="flex gap-3 justify-end">
            <Button type="reset" variant="ghost" @click="resetForm">Annuler</Button>
            <Button type="submit">Soumettre la proposition</Button>
          </div>
        </form>
      </div>
    </PageHeader>

    <span id="proposal-list"></span>
    <LoaderACS v-if="proposalStore.isLoading" />
    <ListView
      v-else
      :data="proposals"
      empty-title="Aucune proposition pour le moment"
      empty-message="Revenez plus tard pour découvrir les nouvelles idées."
      title="Propositions de jeux"
      paginate
      id="proposal-list"
    >
      <template #item="{ item: proposal }">
        <ProposalCard :proposal="proposal" />
      </template>
    </ListView>
  </section>
</template>