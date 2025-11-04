<script setup lang="ts">
import { PageHeader} from '@/components/global';
import ListView from '@/components/global/ListView.vue';
import LoaderACS from '@/components/global/LoaderACS.vue';
import ProposalCard from '@/components/global/ProposalCard.vue';
import { Button, Select } from '@/components/ui';
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
  <PageHeader title="Propositions de jeux">
    <template #icon>
      <VueIcon name="bx:upvote" class="text-christmas-gold text-4xl" />
    </template>
    <form class="flex flex-col md:flex-row gap-4 items-center">
      <label for="proposalFilter" class="text-christmas-gold-light font-semibold flex items-center gap-2">
        <VueIcon name="bs:funnel" class="text-christmas-gold" />
        Ordre de tri :
      </label>
      <Select 
        id="proposalFilter"
        v-model="filter"
        :options="[{ value: 'recent', label: 'Plus récents' }, { value: 'old', label: 'Plus anciens' }, { value: 'popular', label: 'Le plus de votes' }]"
      />
    </form>
    <Button class="place-self-end mt-4" @click="showAddProposalForm = true" v-if="!showAddProposalForm">Ajouter une proposition</Button>
    <form v-if="showAddProposalForm" @reset.prevent="" @submit.prevent="handleSubmit" class="mt-6 p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
      <div class="space-y-4">
        <div>
          <label for="gameSelect" class="block text-sm font-medium text-christmas-gold mb-2">
            Rechercher un jeu
          </label>
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
            <!-- Personnalisation des items du select -->
            <template #item="{ option, isSelected, onSelect }">
              <button
                type="button"
                @click="onSelect(option.value)"
                :class="[
                  'w-full text-left px-4 py-3 hover:bg-christmas-gold/10 transition-colors flex items-center justify-between border-b border-christmas-gold/10 last:border-b-0',
                  isSelected ? 'bg-christmas-gold/20 text-christmas-gold font-bold' : 'text-christmas-gold-light hover:text-christmas-snow'
                ]"
              >
                <div class="flex-1 flex items-center">
                  <img v-if="option.background_image" :src="option.background_image" alt="" class="w-12 h-12 object-cover rounded-lg" />
                  <div class="ml-4">
                    <p>{{ option.label }}</p>
                    <p v-if="option.release_date" class="text-christmas-gold-light text-sm">Date de sortie : {{ option.release_date }}</p>
                  </div>
                </div>
                <VueIcon v-if="isSelected" name="bs:check-circle-fill" class="text-christmas-gold text-lg" />
              </button>
            </template>
          </SelectSearch>
        </div>
        <textarea 
          rows="4" 
          placeholder="Expliquez pourquoi vous proposez ce jeu..." 
          class="w-full px-3 py-2 bg-christmas-navy/50 border border-christmas-gold/30 text-christmas-gold placeholder-christmas-gold-light/50 rounded focus:border-christmas-gold focus:outline-none focus:ring-1 focus:ring-christmas-gold/20 transition-all"
          v-model="form.description"
        />
        <div class="flex gap-4 justify-end items-center">
          <Button type="reset" class="mt-2 place-self-end" @click.stop.prevent="resetForm" color="christmas-red">Annuler</Button>
          <Button type="submit" class="mt-2 place-self-end">Soumettre la proposition</Button>
        </div>
      </div>
    </form>
  </PageHeader>

  <LoaderACS v-if="proposalStore.isLoading" />
  <ListView 
    v-else
    :data="proposals"
    empty-title="Aucune proposition de jeu pour le moment"
    empty-message="Il n'y a actuellement aucune proposition de jeu. Revenez plus tard pour découvrir les nouvelles propositions !"
    title="Propositions de jeux"
  >
    <template #item="{ item: proposal }">
      <ProposalCard :proposal="proposal" />
    </template>
  </ListView>
</template>