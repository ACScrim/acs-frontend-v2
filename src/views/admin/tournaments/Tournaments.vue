<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { TournamentFormData } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { formatDate } from '@vueuse/core';
import { computed, h, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import TournamentForm from './components/TournamentForm.vue';

const adminStore = useAdminStore();
const toastStore = useToastStore();
const tournaments = computed(() => adminStore.getTournaments);
const showCreateForm = ref(false);
const isSubmitting = ref(false);
const deletingId = ref<string | null>(null);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const table = useVueTable({
  get data() {
    return tournaments.value;
  },
  columns: [
    { 
      header: 'Tournoi', 
      accessorKey: 'name',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h('div', [
            h('p', { class: 'font-semibold text-christmas-ice' }, row.original.name),
            h('p', { class: 'text-xs text-christmas-gold-light/70' }, `ID: ${row.original.id}`)
          ])
        ]);
      }
    },
    { 
      header: 'Joueurs', 
      accessorKey: 'players.length',
      cell: ({ row }) => {
        const count = row.original.players?.length || 0;
        const cap = row.original.playerCap;
        return h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'font-semibold text-christmas-gold' }, cap > 0 ? `${count} / ${cap}` : count)
        ]);
      }
    },
    {
      header: 'Équipes publiées ?',
      accessorKey: 'teamsPublished',
      cell: ({ row }) => {
        const published = row.original.teamsPublished;
        return h('div', { class: 'flex items-center gap-2' }, [
          published 
            ? h(VueIcon, { name: 'bs:check-circle-fill', class: 'text-green-500' }) 
            : h(VueIcon, { name: 'bs:x-circle-fill', class: 'text-red-500' }),
          h('span', { class: published ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold' }, published ? 'Oui' : 'Non')
        ]);
      }
    },
    { 
      header: 'Date', 
      accessorKey: 'date',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2 text-christmas-gold-light' }, [
          h(VueIcon, { name: 'bs:calendar2-event', class: 'text-christmas-gold' }),
          formatDate(new Date(row.original.date), 'DD/MM/YYYY HH:mm')
        ]);
      }
    },
    { 
      header: 'Actions', 
      cell: ({ row }) => {
        return h('div', { class: 'flex gap-2' }, [
          h(RouterLink, { 
            to: { name: 'tournament-details', params: { id: row.original.id } },
            class: 'inline-block'
          }, {
            default: () => h(Button, {
              class: 'bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy font-bold hover:shadow-lg hover:shadow-christmas-gold/40 transition-all duration-300 hover:scale-105'
            }, {
              default: () => [
                h(VueIcon, { name: 'bs:pencil-square', class: 'mr-2' }),
                'Modifier'
              ]
            })
          }),
          h('Button',
            {
              onClick: () => handleDeleteTournament(row.original.id),
              disabled: deletingId.value === row.original.id,
              class: 'p-2 rounded-lg bg-christmas-red/20 text-christmas-red hover:bg-christmas-red/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative'
            },
            [
              h(VueIcon, { 
                name: deletingId.value === row.original.id ? 'bs:hourglass' : 'bs:trash3',
                class: deletingId.value === row.original.id ? 'animate-spin' : ''
              })
            ]
          )
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
  adminStore.fetchTournaments();
  adminStore.fetchPlayerLevels();
  adminStore.fetchGames();
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
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-3 animate-fade-in">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-4 bg-gradient-to-br from-christmas-gold to-christmas-gold-light rounded-xl shadow-lg shadow-christmas-gold/20">
            <VueIcon name="bs:trophy-fill" class="text-2xl text-christmas-navy" />
          </div>
          <div>
            <h1 class="text-4xl font-black bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-crimson bg-clip-text text-transparent uppercase tracking-wider">
              Gestion des tournois
            </h1>
            <p class="text-christmas-gold-light flex items-center gap-2 mt-1">
              <span class="w-2 h-2 bg-christmas-gold rounded-full animate-pulse"></span>
              {{ tournaments.length }} tournoi(s) actif(s)
            </p>
          </div>
        </div>
        <Button 
          @click="showCreateForm = !showCreateForm"
          color="christmas-gold"
          class="flex items-center gap-2 h-fit"
        >
          <VueIcon :name="showCreateForm ? 'bs:x-circle' : 'bs:plus-circle'" />
          {{ showCreateForm ? 'Annuler' : 'Créer tournoi' }}
        </Button>
      </div>
    </div>

    <!-- Create Form Section -->
    <transition name="slide">
      <div v-if="showCreateForm" class="animate-in slide-in-from-top duration-300">
        <Card class="p-6 border-2 border-christmas-gold">
          <template #header>
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:plus-circle" />
              Créer un nouveau tournoi
            </h2>
          </template>
          <div class="p-6">
            <TournamentForm 
              @submit="handleCreateTournament"
              @cancel="handleCancelCreate"
            />
          </div>
        </Card>
      </div>
    </transition>

    <!-- Table -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <div class="w-1 h-6 bg-gradient-to-b from-christmas-gold to-christmas-crimson rounded-full"></div>
        <h2 class="text-xl font-bold text-christmas-ice uppercase tracking-wide">Liste des tournois</h2>
      </div>
      
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