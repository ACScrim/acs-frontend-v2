<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Button } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Game } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table';
import { formatDate } from '@vueuse/core';
import { computed, h, onMounted, ref } from 'vue';
import GameForm from './components/GameForm.vue';

const adminStore = useAdminStore();
const toastStore = useToastStore();
const games = computed(() => adminStore.games);
const showCreateForm = ref(false);
const showEditForm = ref(false);
const editingGameId = ref<string | null>(null);
const isSubmitting = ref(false);
const deletingId = ref<string | null>(null);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const editingGame = computed(() => {
  return editingGameId.value ? games.value.find(g => g.id === editingGameId.value) : null;
});

const table = useVueTable({
  get data() {
    return games.value;
  },
  columns: [
    {
      header: 'Jeu',
      accessorKey: 'name',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-3' }, [
          h('img', {
            src: row.original.imageUrl,
            alt: row.original.name,
            class: 'w-12 h-12 rounded-lg object-cover'
          }),
          h('div', [
            h('p', { class: 'font-semibold text-christmas-ice' }, row.original.name),
            h('p', { class: 'text-xs text-christmas-gold-light/70' }, `ID: ${row.original.id}`)
          ])
        ]);
      },
      sortingFn: 'alphanumeric'
    },
    {
      header: 'Rôles',
      accessorKey: 'roles.length',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'text-christmas-ice' }, `${row.original.roles?.length || 0} rôle(s)`)
        ]);
      },
      sortingFn: (rowA, rowB) => {
        return (rowA.original.roles?.length || 0) - (rowB.original.roles?.length || 0);
      }
    },
    {
      header: 'Link Regex',
      accessorKey: 'gameProfileLinkRegex',
      cell: ({ row }) => {
        const regex = row.original.gameProfileLinkRegex;
        return h('span', { class: 'text-christmas-gold-light text-sm' }, regex ? '✓ Configuré' : '—');
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.gameProfileLinkRegex ? 1 : 0;
        const b = rowB.original.gameProfileLinkRegex ? 1 : 0;
        return a - b;
      }
    },
    {
      header: 'Name Regex',
      accessorKey: 'gameUsernameRegex',
      cell: ({ row }) => {
        const regex = row.original.gameUsernameRegex;
        return h('span', { class: 'text-christmas-gold-light text-sm' }, regex ? '✓ Configuré' : '—');
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.gameUsernameRegex ? 1 : 0;
        const b = rowB.original.gameUsernameRegex ? 1 : 0;
        return a - b;
      }
    },
    {
      header: 'Créé le',
      accessorKey: 'createdAt',
      cell: ({ row }) => {
        return h('span', { class: 'text-christmas-gold-light text-sm' }, 
          formatDate(new Date(row.original.createdAt), 'DD/MM/YYYY HH:mm')
        );
      },
      sortingFn: (rowA, rowB) => {
        return new Date(rowA.original.createdAt).getTime() - new Date(rowB.original.createdAt).getTime();
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h(Button, {
            onClick: () => handleEditGame(row.original),
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
            onClick: () => handleDeleteGame(row.original.id, row.original.name),
            color: 'christmas-red',
            class: 'flex items-center gap-2 h-fit',
            disabled: deletingId.value === row.original.id || editingGameId.value === row.original.id
          }, {
            default: () => [
              h(VueIcon, { name: deletingId.value === row.original.id ? 'bs:hourglass-split' : 'bs:trash' })
            ]
          })
        ]);
      }
    }
  ],
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
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
  adminStore.fetchGames();
});

const handleCreateGame = async (gameData: { name: string; rawgId?: number; imageUrl: string; description?: string; roles: Array<{ name: string; color: string }>; gameProfileLinkRegex?: string }) => {
  try {
    isSubmitting.value = true;
    await adminStore.createGame(gameData);
    toastStore.success('Jeu créé avec succès.');
    showCreateForm.value = false;
    await adminStore.fetchGames();
  } catch (error) {
    toastStore.error('Erreur lors de la création du jeu.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleEditGame = (game: Game) => {
  editingGameId.value = game.id;
  showEditForm.value = true;
};

const handleUpdateGame = async (gameData: { roles: Array<{ name: string; color: string }>; gameProfileLinkRegex?: string, gameUsernameRegex?: string }) => {
  if (!editingGameId.value) return;

  try {
    isSubmitting.value = true;
    await adminStore.updateGame(editingGameId.value, {
      roles: gameData.roles,
      gameProfileLinkRegex: gameData.gameProfileLinkRegex,
      gameUsernameRegex: gameData.gameUsernameRegex
    });
    toastStore.success('Jeu modifié avec succès.');
    showEditForm.value = false;
    editingGameId.value = null;
    await adminStore.fetchGames();
  } catch (error) {
    toastStore.error('Erreur lors de la modification du jeu.');
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancelCreate = () => {
  showCreateForm.value = false;
};

const handleCancelEdit = () => {
  showEditForm.value = false;
  editingGameId.value = null;
};

const handleDeleteGame = async (gameId: string, gameName: string) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${gameName}" ? Cette action est irréversible.`)) {
    return;
  }

  try {
    deletingId.value = gameId;
    await adminStore.deleteGame(gameId);
    toastStore.success('Jeu supprimé avec succès.');
    await adminStore.fetchGames();
  } catch (error) {
    toastStore.error('Erreur lors de la suppression du jeu.');
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
            <VueIcon name="bx:game" class="text-2xl text-christmas-navy" />
          </div>
          <div>
            <h1 class="text-4xl font-black bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-crimson bg-clip-text text-transparent uppercase tracking-wider">
              Gestion des jeux
            </h1>
            <p class="text-christmas-gold-light flex items-center gap-2 mt-1">
              <span class="w-2 h-2 bg-christmas-gold rounded-full animate-pulse"></span>
              {{ games.length }} jeu(x) disponible(s)
            </p>
          </div>
        </div>
        <Button 
          @click="showCreateForm = !showCreateForm"
          color="christmas-gold"
          class="flex items-center gap-2 h-fit"
        >
          <VueIcon :name="showCreateForm ? 'bs:x-circle' : 'bs:plus-circle'" />
          {{ showCreateForm ? 'Annuler' : 'Ajouter un jeu' }}
        </Button>
      </div>
    </div>

    <!-- Create Form Section -->
    <transition name="slide">
      <div v-if="showCreateForm" class="animate-fade-in">
        <GameForm 
          :is-loading="isSubmitting"
          @submit="handleCreateGame"
          @cancel="handleCancelCreate"
        />
      </div>
    </transition>

    <!-- Edit Form Section -->
    <transition name="slide">
      <div v-if="showEditForm && editingGame" class="animate-fade-in">
        <GameForm 
          :is-loading="isSubmitting"
          :is-editing="true"
          :editing-game="editingGame"
          @submit="handleUpdateGame"
          @cancel="handleCancelEdit"
        />
      </div>
    </transition>

    <!-- Table Container -->
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center gap-2">
        <div class="w-1 h-6 bg-gradient-to-b from-christmas-gold to-christmas-crimson rounded-full"></div>
        <h2 class="text-xl font-bold text-christmas-ice uppercase tracking-wide">Liste des jeux</h2>
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
  animation: fade-in 0.1s ease-out;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.1s ease;
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