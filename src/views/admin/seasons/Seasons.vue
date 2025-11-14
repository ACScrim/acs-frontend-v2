<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import useTournamentStore from '@/stores/tournamentStore';
import type { Season } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { computed, h, onMounted, ref } from 'vue';
import SeasonForm from './components/SeasonForm.vue';

const adminStore = useAdminStore();
const tournamentStore = useTournamentStore();
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
        return h('span', { class: 'font-bold text-christmas-gold' }, `Saison ${row.original.number}`);
      }
    },
    {
      header: 'Tournois',
      accessorKey: 'tournaments.length',
      cell: ({ row }) => {
        return h('span', { class: 'text-christmas-gold-light text-sm' }, 
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
          return h('span', { class: 'text-christmas-gold-light/50 text-sm' }, '—');
        }
        const winnerName = typeof winner === 'string' ? winner : (winner as any)?.username || '—';
        return h('span', { class: 'text-christmas-gold text-sm' }, winnerName);
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h(Button, {
            onClick: () => handleEditSeason(row.original),
            color: 'christmas-gold',
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
            color: 'christmas-red',
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
  tournamentStore.fetchTournaments();
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
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-3 animate-fade-in">
      <h1 class="text-3xl font-bold text-christmas-ice">Gestion des saisons</h1>
      <p class="text-christmas-gold-light">Gérez les saisons, assignez des tournois et suivez les gagnants</p>
      <div class="flex gap-3 pt-2">
        <Button
          v-if="!showCreateForm"
          @click="showCreateForm = true"
          class="flex items-center gap-2"
        >
          <VueIcon name="bs:plus-circle" />
          Créer une saison
        </Button>
      </div>
    </div>

    <!-- Create Form Section -->
    <transition name="slide">
      <div v-if="showCreateForm" class="animate-fade-in">
        <SeasonForm
          :is-loading="isSubmitting"
          @submit="handleCreateSeason"
          @cancel="handleCancelCreate"
        />
      </div>
    </transition>

    <!-- Edit Form Section -->
    <transition name="slide">
      <div v-if="showEditForm && editingSeason" class="animate-fade-in">
        <SeasonForm
          :is-loading="isSubmitting"
          :is-editing="true"
          :editing-season="editingSeason"
          @submit="handleUpdateSeason"
          @cancel="handleCancelEdit"
        />
      </div>
    </transition>

    <!-- Table Container -->
    <div class="space-y-4 animate-fade-in">
      <TableTanstack :table="table" :paginated="true" />
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
