<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import useTournamentStore from '@/stores/tournamentStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table';
import { formatDate } from '@vueuse/core';
import { computed, h, onMounted, ref } from 'vue';

const adminStore = useAdminStore();
const tournamentStore = useTournamentStore();

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

// Filtres
const playerNameFilter = ref('');
const selectedGameFilter = ref('');
const selectedLevelFilter = ref('');
const selectedRankFilter = ref('');
const selectedTournamentFilter = ref('');

const levels = ['débutant', 'intermédiaire', 'avancé', 'expert'];

// Computed - données filtrées
const games = computed(() => adminStore.games);
const allPlayerLevels = computed(() => adminStore.playerLevels);

const tournaments = computed(() => {
  if (!selectedGameFilter.value) return [];
  return tournamentStore.tournaments.filter(t => t.gameId === selectedGameFilter.value);
});

const filteredPlayerLevels = computed(() => {
  return allPlayerLevels.value.filter(level => {
    // Filtre par nom de joueur
    if (playerNameFilter.value && !level.user?.username.toLowerCase().includes(playerNameFilter.value.toLowerCase())) {
      return false;
    }
    
    // Filtre par jeu
    if (selectedGameFilter.value && level.gameId !== selectedGameFilter.value) {
      return false;
    }
    
    // Filtre par niveau
    if (selectedLevelFilter.value && level.level !== selectedLevelFilter.value) {
      return false;
    }
    
    // Filtre par rang
    if (selectedRankFilter.value && level.rank !== selectedRankFilter.value) {
      return false;
    }
    
    // Filtre par tournoi - affiche seulement les joueurs du tournoi sélectionné
    if (selectedTournamentFilter.value) {
      const selectedTournament = tournamentStore.tournaments.find(t => t.id === selectedTournamentFilter.value);
      if (selectedTournament) {
        const playerIds = selectedTournament.players.map(p => p.user.id);
        if (!playerIds.includes(level.userId)) {
          return false;
        }
      }
    }
    
    return true;
  });
});

const table = useVueTable({
  get data() {
    return filteredPlayerLevels.value;
  },
  columns: [
    {
      header: 'Joueur',
      accessorKey: 'user.username',
      cell: ({ row }) => {
        const user = row.original.user;
        return h('div', { class: 'flex items-center gap-3' }, [
          h('img', {
            src: user?.avatarUrl || '',
            alt: user?.username,
            class: 'w-10 h-10 rounded-full border border-christmas-gold/30'
          }),
          h('div', [
            h('p', { class: 'font-semibold text-christmas-ice' }, user?.username || 'N/A'),
          ])
        ]);
      }
    },
    {
      header: 'Jeu',
      accessorKey: 'game.name',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h('img', {
            src: row.original.game?.imageUrl || '',
            alt: row.original.game?.name,
            class: 'w-8 h-8 rounded object-cover'
          }),
          h('span', { class: 'text-christmas-gold' }, row.original.game?.name || 'N/A')
        ]);
      }
    },
    {
      header: 'Pseudo',
      accessorKey: 'gameUsername',
      cell: ({ cell }) => {
        return h('span', { class: 'text-christmas-gold-light' }, cell.getValue() as string);
      }
    },
    {
      header: 'Niveau',
      accessorKey: 'level',
      cell: ({ cell }) => {
        const level = cell.getValue() as string;
        const levelConfig: Record<string, { color: string; icon: string }> = {
          'débutant': { color: 'text-green-400 bg-green-500/20', icon: 'bs:mortarboard' },
          'intermédiaire': { color: 'text-yellow-400 bg-yellow-500/20', icon: 'bs:lightning-fill' },
          'avancé': { color: 'text-orange-400 bg-orange-500/20', icon: 'bs:fire' },
          'expert': { color: 'text-red-400 bg-red-500/20', icon: 'bs:crown-fill' }
        };
        const config = levelConfig[level] || { color: 'text-christmas-gold-light', icon: 'bs:question-circle' };

        return h('div', { class: `flex items-center gap-2 px-3 py-1 rounded-full w-fit ${config.color}` }, [
          h(VueIcon, { name: config.icon, class: 'text-sm' }),
          h('span', { class: 'font-semibold text-sm capitalize' }, level)
        ]);
      }
    },
    {
      header: 'Rang',
      accessorKey: 'rank',
      cell: ({ row }) => {
        return h('span', { class: row.original.isRanked ? 'text-christmas-gold font-semibold' : 'text-christmas-gold-light/50 italic' }, 
          row.original.isRanked ? (row.original.rank || 'N/A') : '—'
        );
      }
    },
    {
      header: 'Rôles',
      accessorKey: 'selectedRoles',
      cell: ({ row }) => {
        const roles = row.original.selectedRoles || [];
        const gameRoles = row.original.game?.roles || [];
        
        if (roles.length === 0) {
          return h('span', { class: 'text-christmas-gold-light/50 italic' }, '—');
        }

        return h('div', { class: 'flex flex-wrap gap-2' }, 
          roles.map(roleName => {
            const roleConfig = gameRoles.find(r => r.name === roleName);
            return h('div', {
              class: 'px-2 py-1 rounded-full text-xs font-semibold',
              style: { backgroundColor: roleConfig?.color + '33', color: roleConfig?.color || '#D4AF37' }
            }, roleName);
          })
        );
      }
    },
    {
      header: 'Lien Profil',
      accessorKey: 'gameProfileLink',
      cell: ({ row }) => {
        const link = row.original.gameProfileLink;
        if (!link) {
          return h('span', { class: 'text-christmas-gold-light/50 italic' }, '—');
        }
        
        return h('a', {
          href: link,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-christmas-gold hover:text-christmas-gold-light underline flex items-center gap-1 w-fit'
        }, [
          h(VueIcon, { name: 'bs:box-arrow-up-right', class: 'text-sm' }),
          h('span', 'Voir le profil')
        ]);
      }
    },
    {
      header: 'Commentaire',
      accessorKey: 'comment',
      cell: ({ cell }) => {
        return h('span', { class: 'text-christmas-gold-light/70 text-sm', title: cell.getValue() as string },
          cell.getValue().substring(0, 30) + (cell.getValue().length > 30 ? '...' : '') || '—'
        );
      }
    }
  ],
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get pagination() {
      return pagination.value;
    },
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater;
  }
});

const clearFilters = () => {
  playerNameFilter.value = '';
  selectedGameFilter.value = '';
  selectedLevelFilter.value = '';
  selectedRankFilter.value = '';
  selectedTournamentFilter.value = '';
};

onMounted(async () => {
  await adminStore.fetchPlayerLevels();
  await adminStore.fetchGames();
  await tournamentStore.fetchTournaments();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-3 animate-fade-in">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent flex items-center gap-3">
        <VueIcon name="bs:bar-chart-fill" class="text-christmas-gold" />
        Niveaux de jeu des joueurs
      </h1>
      <p class="text-christmas-gold-light">
        Gérez et consultez les niveaux de jeu de tous les joueurs
      </p>
    </div>

    <!-- Filtres -->
    <Card class="bg-christmas-navy/50 border-2 border-christmas-gold/30 p-6 space-y-4">
      <h2 class="text-lg font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="bs:funnel-fill" />
        Filtres
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Filtre nom joueur -->
        <div>
          <label class="block text-sm font-medium text-christmas-gold mb-2">
            <VueIcon name="bs:search" class="inline mr-1" />
            Nom du joueur
          </label>
          <input
            v-model="playerNameFilter"
            type="text"
            placeholder="Chercher un joueur..."
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
          />
        </div>

        <!-- Filtre jeu -->
        <div>
          <label class="block text-sm font-medium text-christmas-gold mb-2">
            <VueIcon name="bs:controller" class="inline mr-1" />
            Jeu
          </label>
          <select
            v-model="selectedGameFilter"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none"
          >
            <option value="">-- Tous les jeux --</option>
            <option v-for="game in games" :key="game.id" :value="game.id">
              {{ game.name }}
            </option>
          </select>
        </div>

        <!-- Filtre niveau -->
        <div>
          <label class="block text-sm font-medium text-christmas-gold mb-2">
            <VueIcon name="bs:star-fill" class="inline mr-1" />
            Niveau
          </label>
          <select
            v-model="selectedLevelFilter"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none"
          >
            <option value="">-- Tous les niveaux --</option>
            <option v-for="level in levels" :key="level" :value="level">
              {{ level.charAt(0).toUpperCase() + level.slice(1) }}
            </option>
          </select>
        </div>

        <!-- Filtre tournoi (visible si jeu sélectionné) -->
        <div v-if="selectedGameFilter">
          <label class="block text-sm font-medium text-christmas-gold mb-2">
            <VueIcon name="bs:calendar-event-fill" class="inline mr-1" />
            Tournoi
          </label>
          <select
            v-model="selectedTournamentFilter"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none"
          >
            <option value="">-- Tous les tournois --</option>
            <option v-for="tournament in tournaments" :key="tournament.id" :value="tournament.id">
              {{ tournament.name }} ({{ formatDate(new Date(tournament.date), 'DD/MM/YYYY') }})
            </option>
          </select>
        </div>
      </div>

      <!-- Bouton réinitialiser filtres -->
      <div class="flex justify-end pt-2">
        <Button
          type="button"
          @click="clearFilters"
          color="christmas-red"
          class="flex items-center gap-2"
        >
          <VueIcon name="bs:x-circle" />
          Réinitialiser les filtres
        </Button>
      </div>
    </Card>

    <!-- Table Container -->
    <div class="space-y-4 animate-fade-in">
      <div class="flex items-center justify-between">
        <p class="text-christmas-gold-light">
          {{ filteredPlayerLevels.length }} niveau(x) trouvé(s)
        </p>
      </div>
      <TableTanstack :table="table" paginated />
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
</style>
