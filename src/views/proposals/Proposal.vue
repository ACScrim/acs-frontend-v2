<script setup lang="ts">
import { PageHeader} from '@/components/global';
import ListView from '@/components/global/ListView.vue';
import LoaderACS from '@/components/global/LoaderACS.vue';
import ProposalCard from '@/components/global/ProposalCard.vue';
import { Select } from '@/components/ui';
import useProposalStore from '@/stores/proposalStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { whenever } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

const proposalStore = useProposalStore();
const proposals = computed(() => proposalStore.proposals);

const filter = ref<'recent' | 'old' | 'popular'>('recent');

onMounted(() => {
  proposalStore.fetchProposals();
});

whenever(filter, () => {
  proposalStore.sortProposals(filter.value);
})
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