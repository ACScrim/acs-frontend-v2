<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import {useToastStore} from '@/stores/toastStore';
import type {Season} from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {getCoreRowModel, getPaginationRowModel, useVueTable} from '@tanstack/vue-table';
import {computed, h, onMounted, ref} from 'vue';
import SeasonForm from './components/SeasonForm.vue';

const adminStore = useAdminStore();
const toastStore = useToastStore();

const seasons = computed(() => adminStore.seasons);
const showCreateForm = ref(false);
const showEditForm = ref(false);
const editingSeasonId = ref<string | null>(null);
const isSubmitting = ref(false);
const deletingId = ref<string | null>(null);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const editingSeason = computed(() => {
  return editingSeasonId.value ? seasons.value.find(s => s.id === editingSeasonId.value) : null;
});

const table = useVueTable({
  get data() {
    return seasons.value;
  },
  columns: [
    {
      header: 'Saison',
      accessorKey: 'number',
      cell: ({ row }) => {
        return h('span', { class: 'font-bold text-foam-50' }, row.original.number === 0 ? 'Hors saison' : `Saison ${row.original.number}`);
      }
    },
    {
      header: 'Tournois',
      accessorKey: 'tournaments.length',
      cell: ({ row }) => {
        return h('span', { class: 'text-foam-200 text-sm' },
          `${row.original.tournaments.length} tournoi(s)`
        );
      }
    },
    {
      header: 'Gagnant',
      accessorKey: 'winner',
      cell: ({ row }) => {
        const winner = row.original.winner;
        if (!winner) {
          return h('span', { class: 'text-foam-300/60 text-sm' }, '—');
        }
        const winnerName = typeof winner === 'string' ? winner : (winner as any)?.username || '—';
        return h('span', { class: 'text-white text-sm' }, winnerName);
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h(Button, {
            onClick: () => handleEditSeason(row.original),
            class: 'flex items-center gap-2 h-fit',
            disabled: deletingId.value === row.original.id
          }, {
            default: () => [
              h(VueIcon, { name: 'bs:pencil-square' }),
              'Modifier'
            ]
          }),
          h(Button, {
            onClick: () => handleDeleteSeason(row.original.id, row.original.number),
            variant: 'danger',
            class: 'flex items-center gap-2 h-fit',
            disabled: deletingId.value === row.original.id || editingSeasonId.value === row.original.id
          }, {
            default: () => [
              h(VueIcon, { name: deletingId.value === row.original.id ? 'bs:hourglass-split' : 'bs:trash' }),
              deletingId.value === row.original.id ? 'Suppression...' : 'Supprimer'
            ]
          })
        ]);
      }
    }
  ],
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get pagination() {
      return pagination.value;
    }
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater;
  }
});

onMounted(() => {
  adminStore.fetchSeasons();
  adminStore.fetchTournaments();
});

const handleCreateSeason = async (data: { number: number; tournamentIds: string[] }) => {
  try {
    isSubmitting.value = true;
    await adminStore.createSeason(data);
    toastStore.success('Saison créée avec succès.');
    showCreateForm.value = false;
    await adminStore.fetchSeasons();
  } catch (error) {
    toastStore.error('Erreur lors de la création de la saison.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleEditSeason = (season: Season) => {
  editingSeasonId.value = season.id;
  showEditForm.value = true;
};

const handleUpdateSeason = async (data: { number: number; tournamentIds: string[] }) => {
  if (!editingSeasonId.value) return;

  try {
    isSubmitting.value = true;
    await adminStore.updateSeason(editingSeasonId.value, data);
    toastStore.success('Saison modifiée avec succès.');
    showEditForm.value = false;
    editingSeasonId.value = null;
    await adminStore.fetchSeasons();
  } catch (error) {
    toastStore.error('Erreur lors de la modification de la saison.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancelCreate = () => {
  showCreateForm.value = false;
};

const handleCancelEdit = () => {
  showEditForm.value = false;
  editingSeasonId.value = null;
};

const handleDeleteSeason = async (seasonId: string, seasonNumber: number) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer la saison ${seasonNumber} ? Cette action est irréversible.`)) {
    return;
  }

  try {
    deletingId.value = seasonId;
    await adminStore.deleteSeason(seasonId);
    toastStore.success('Saison supprimée avec succès.');
    await adminStore.fetchSeasons();
  } catch (error) {
    toastStore.error('Erreur lors de la suppression de la saison.');
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
          <span class="rounded-2xl bg-white/5 p-3"><VueIcon name="bx:game" class="text-accent-300" /></span>
          Gestion des saisons
        </h1>
        <p class="muted flex items-center gap-2">{{ seasons.length }} saisons</p>
      </div>
      <Button @click="showCreateForm = !showCreateForm" class="gap-2">
        <VueIcon :name="showCreateForm ? 'bs:x-circle' : 'bs:plus-circle'" />
        {{ showCreateForm ? 'Annuler' : 'Créer une saison' }}
      </Button>
    </header>

    <transition name="slide">
      <Card v-if="showCreateForm" class="glass-panel p-6">
        <SeasonForm :is-loading="isSubmitting" @submit="handleCreateSeason" @cancel="handleCancelCreate" />
      </Card>
    </transition>
    <transition name="slide">
      <Card v-if="showEditForm && editingSeason" class="glass-panel p-6">
        <SeasonForm :is-loading="isSubmitting" :is-editing="true" :editing-season="editingSeason" @submit="handleUpdateSeason" @cancel="handleCancelEdit" />
      </Card>
    </transition>

    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
        <p class="text-sm uppercase tracking-[0.4em] text-foam-300/70">Liste des saisons</p>
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
      </div>
      <Card class="glass-panel p-0">
        <TableTanstack :table="table" :paginated="true" />
      </Card>
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from,
.slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
