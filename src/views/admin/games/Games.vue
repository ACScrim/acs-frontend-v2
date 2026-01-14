<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import {Button, Card} from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import {useToastStore} from '@/stores/toastStore';
import type {Game} from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable} from '@tanstack/vue-table';
import {formatDate} from '@vueuse/core';
import {computed, h, nextTick, onMounted, ref} from 'vue';
import GameForm from './components/GameForm.vue';
import {useTablePaginationQueryString} from "@/composables/useTablePaginationQueryString";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const games = computed(() => adminStore.games);
const showCreateForm = ref(false);
const showEditForm = ref(false);
const editingGameId = ref<string | null>(null);
const isSubmitting = ref(false);
const deletingId = ref<string | null>(null);
const gameNameFilter = ref('');

const filteredGames = computed(() => {
  if (!gameNameFilter.value.trim()) {
    return games.value;
  }
  return games.value.filter(game =>
    game.name.toLowerCase().includes(gameNameFilter.value.toLowerCase())
  );
});

const paginationQs = useTablePaginationQueryString({ param: 'page', defaultPage: 1, cleanDefault: false });

const editingGame = computed(() => {
  return editingGameId.value ? games.value.find(g => g.id === editingGameId.value) : null;
});

const table = useVueTable({
  get data() {
    return filteredGames.value;
  },
  columns: [
    {
      header: 'Jeu',
      accessorKey: 'name',
      cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
        h('img', { src: row.original.imageUrl, alt: row.original.name, class: 'size-12 rounded-2xl object-cover' }),
        h('div', [
          h('p', { class: 'font-semibold text-white' }, row.original.name),
          h('p', { class: 'text-xs text-foam-300/70' }, `ID: ${row.original.id}`)
        ])
      ]),
      sortingFn: 'alphanumeric'
    },
    {
      header: 'Rôles',
      cell: ({ row }) => h('span', { class: 'text-sm text-white' }, `${row.original.roles?.length || 0}`)
    },
    {
      header: 'Link Regex',
      accessorKey: 'gameProfileLinkRegex',
      cell: ({ row }) => {
        const regex = row.original.gameProfileLinkRegex;
        return h('span', { class: 'text-foam-200 text-sm' }, regex ? '✓ Configuré' : '—');
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
        return h('span', { class: 'text-foam-200 text-sm' }, regex ? '✓ Configuré' : '—');
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
        return h('span', { class: 'text-foam-300 text-sm' },
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
            variant: 'danger',
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
  autoResetPageIndex: false,
  state: {
    get pagination() {
      return paginationQs.pagination.value;
    }
  },
  onPaginationChange: paginationQs.onPaginationChange
});

onMounted(async () => {
  await adminStore.fetchGames();
  await nextTick();
  const targetPageIndex = paginationQs.pagination.value.pageIndex;
  const pageCount = table.getPageCount();
  if (targetPageIndex > 0 && pageCount > 0 && targetPageIndex < pageCount) {
    table.setPageIndex(targetPageIndex);
  }
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
  <section class="space-y-8">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Administration</p>
        <h1 class="hero-title flex items-center gap-3">
          <span class="rounded-2xl bg-white/5 p-3"><VueIcon name="bx:game" class="text-accent-300" /></span>
          Gestion des jeux
        </h1>
        <p class="muted flex items-center gap-2">{{ filteredGames.length }} jeu{{ filteredGames.length > 1 ? "x" : "" }} disponible{{ filteredGames.length > 1 ? "s" : "" }}</p>
        <input
          v-model="gameNameFilter"
          type="text"
          placeholder="Rechercher un jeu..."
          class="w-full mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-foam-300/50 transition focus:border-accent-300 focus:outline-none"
        />
      </div>
      <Button @click="showCreateForm = !showCreateForm" class="gap-2 h-fit">
        <VueIcon :name="showCreateForm ? 'bs:x-circle' : 'bs:plus-circle'" />
        {{ showCreateForm ? 'Annuler' : 'Ajouter un jeu' }}
      </Button>
    </header>

    <transition name="slide">
      <Card v-if="showCreateForm" class="glass-panel p-6">
        <GameForm :is-loading="isSubmitting" @submit="handleCreateGame" @cancel="handleCancelCreate" />
      </Card>
    </transition>

    <transition name="slide">
      <Card v-if="showEditForm && editingGame" class="glass-panel p-6">
        <GameForm :is-loading="isSubmitting" :is-editing="true" :editing-game="editingGame" @submit="handleUpdateGame" @cancel="handleCancelEdit" />
      </Card>
    </transition>

    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
        <p class="text-sm uppercase tracking-[0.4em] text-foam-300/70">Liste des jeux</p>
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
      </div>
      <TableTanstack :table="table" :paginated="true" />
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from,
.slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>