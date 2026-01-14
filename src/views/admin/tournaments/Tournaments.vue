<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Button, Card, Badge } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament, TournamentFormData } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { getCoreRowModel, getPaginationRowModel, useVueTable, type ColumnDef } from '@tanstack/vue-table';
import { formatDate } from '@vueuse/core';
import { computed, h, nextTick, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import TournamentForm from './components/TournamentForm.vue';
import { useHead } from '@vueuse/head';
import { useTablePaginationQueryString } from '@/composables/useTablePaginationQueryString';

useHead({ title: 'Admin · Tournois' });

const adminStore = useAdminStore();
const toastStore = useToastStore();
const tournaments = computed(() => adminStore.getTournaments);
const showCreateForm = ref(false);
const isSubmitting = ref(false);
const deletingId = ref<string | null>(null);

const paginationQs = useTablePaginationQueryString({ param: 'page', defaultPage: 1, cleanDefault: false });

const columns: ColumnDef<Tournament>[] = [
  {
    header: 'Tournoi',
    accessorKey: 'name',
    cell: ({ row }) => h('div', { class: 'space-y-1' }, [
      h('p', { class: 'font-semibold text-white' }, row.original.name),
      h('p', { class: 'text-xs text-foam-300/70' }, `ID: ${row.original.id}`)
    ])
  },
  {
    header: 'Joueurs',
    cell: ({ row }) => {
      const count = row.original.players?.length || 0;
      const cap = row.original.playerCap;
      return h('span', { class: 'text-white font-semibold' }, cap > 0 ? `${count} / ${cap}` : count);
    }
  },
  {
    header: 'Équipes publiées ?',
    cell: ({ row }) => {
      const published = row.original.teamsPublished;
      return h(Badge, { tone: published ? 'emerald' : 'blush', size: 'md' }, () => published ? 'Oui' : 'Non');
    }
  },
  {
    header: 'Date',
    cell: ({ row }) => formatDate(new Date(row.original.date), 'DD/MM/YYYY HH:mm')
  },
  {
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(RouterLink, { to: { name: 'tournament-details', params: { id: row.original.id } } }, () =>
        h(Button, { variant: 'outline', size: 'sm', class: 'gap-2' }, () => [h(VueIcon, { name: 'bs:pencil-square' }), 'Modifier'])
      ),
      h(Button, {
        variant: 'ghost',
        size: 'sm',
        disabled: deletingId.value === row.original.id,
        onClick: () => handleDeleteTournament(row.original.id)
      }, () => h(VueIcon, { name: deletingId.value === row.original.id ? 'bs:hourglass' : 'bs:trash', class: deletingId.value === row.original.id ? 'animate-spin' : '' }))
    ])
  }
];

const table = useVueTable<Tournament>({
  get data() {
    return tournaments.value;
  },
  columns,
  enableSorting: false,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  autoResetPageIndex: false,
  state: {
    get pagination() {
      return paginationQs.pagination.value;
    }
  },
  onPaginationChange: paginationQs.onPaginationChange
});

onMounted(async () => {
  await adminStore.fetchTournaments();
  await adminStore.fetchPlayerLevels();
  await adminStore.fetchGames();
  await nextTick();
  const targetPageIndex = paginationQs.pagination.value.pageIndex;
  const pageCount = table.getPageCount();
  if (targetPageIndex > 0 && pageCount > 0 && targetPageIndex < pageCount) {
    table.setPageIndex(targetPageIndex);
  }
});

const handleCreateTournament = async (formData: TournamentFormData) => {
  try {
    isSubmitting.value = true;
    await adminStore.createTournament(formData);
    toastStore.success('Tournoi créé avec succès.');
    showCreateForm.value = false;
    await adminStore.fetchTournaments();
  } catch (error) {
    toastStore.error('Erreur lors de la création du tournoi.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancelCreate = () => {
  showCreateForm.value = false;
};

const handleDeleteTournament = async (tournamentId: string) => {
  // Confirmation
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ? Cette action est irréversible.')) {
    return;
  }

  try {
    deletingId.value = tournamentId;
    await adminStore.deleteTournament(tournamentId);
    toastStore.success('Tournoi supprimé avec succès.');
    await adminStore.fetchTournaments();
  } catch (error) {
    toastStore.error('Erreur lors de la suppression du tournoi.');
  } finally {
    deletingId.value = null;
  }
};
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Administration</p>
        <h1 class="hero-title flex items-center gap-3">
          <span class="rounded-2xl bg-white/5 p-3"><VueIcon name="bs:trophy-fill" class="text-accent-300" /></span>
          Gestion des tournois
        </h1>
        <p class="muted flex items-center gap-2">{{ tournaments.length }} tournoi(s) actif(s)</p>
      </div>
      <Button @click="showCreateForm = !showCreateForm" class="gap-2">
        <VueIcon :name="showCreateForm ? 'bs:x-circle' : 'bs:plus-circle'" />
        {{ showCreateForm ? 'Annuler' : 'Créer tournoi' }}
      </Button>
    </header>

    <transition name="slide">
      <Card v-if="showCreateForm" class="glass-panel p-6">
        <template #header>
          <h2 class="text-xl font-semibold text-white flex items-center gap-2">
            <VueIcon name="bs:plus-circle" /> Nouveau tournoi
          </h2>
        </template>
        <TournamentForm @submit="handleCreateTournament" @cancel="handleCancelCreate" :loading="isSubmitting" />
      </Card>
    </transition>

    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
        <p class="text-sm uppercase tracking-[0.4em] text-foam-300/70">Liste des tournois</p>
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
      </div>
      <TableTanstack :table="table" :paginated="true" />
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from,
.slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>