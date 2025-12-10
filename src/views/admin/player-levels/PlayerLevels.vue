<script setup lang="ts">
import TableTanstack from '@/components/global/TableTanstack.vue';
import {Button, Card} from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import useTournamentStore from '@/stores/tournamentStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {getCoreRowModel, getPaginationRowModel, getSortedRowModel, useVueTable} from '@tanstack/vue-table';
import {computed, h, onMounted, ref} from 'vue';
import ProfileLink from "@/components/global/ProfileLink.vue";
import ACSSelect from "@/components/ui/ACSSelect.vue";

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
      accessorKey: 'user',
      cell: ({ row, getValue }) => h(ProfileLink, { user: getValue(), size: 10 })
    },
    {
      header: 'Jeu',
      accessorKey: 'game.name',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-2' }, [
          h('img', {
            src: row.original.game?.imageUrl || '',
            alt: row.original.game?.name,
            class: 'w-8 h-8 rounded object-cover',
            title: row.original.game?.name || 'N/A'
          })
        ]);
      }
    },
    {
      header: 'Pseudo',
      accessorKey: 'gameUsername',
      cell: ({ cell }) => {
        return h('span', { class: 'text-foam-200' }, cell.getValue() as string || '—');
      }
    },
    {
      header: 'Niveau',
      accessorKey: 'level',
      cell: ({ cell }) => {
        const level = cell.getValue() as string;
        const levelConfig: Record<string, { color: string; icon: string }> = {
          'débutant': { color: 'bg-emerald-500/15 text-emerald-200', icon: 'bs:mortarboard' },
          'intermédiaire': { color: 'bg-amber-400/15 text-amber-200', icon: 'bs:lightning-fill' },
          'avancé': { color: 'bg-orange-500/15 text-orange-200', icon: 'bs:fire' },
          'expert': { color: 'bg-rose-500/20 text-rose-100', icon: 'bs:crown-fill' }
        };
        const config = levelConfig[level] || { color: 'bg-white/10 text-foam-200', icon: 'bs:question-circle' };

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
        return h('span', { class: row.original.isRanked ? 'text-foam-50 font-semibold' : 'text-foam-300/60 italic' },
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
          return h('span', { class: 'text-foam-300/60 italic' }, '—');
        }

        return h('div', { class: 'flex flex-wrap gap-2' }, 
          roles.map(roleName => {
            const roleConfig = gameRoles.find(r => r.name === roleName);
            return h('div', {
              class: 'px-2 py-1 rounded-full text-xs font-semibold border border-white/10',
              style: { backgroundColor: roleConfig?.color + '26', color: roleConfig?.color || '#E0E7FF' }
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
          return h('span', { class: 'text-foam-300/60 italic' }, '—');
        }
        
        return h('a', {
          href: link,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-accent-200 hover:text-white underline flex items-center gap-1 w-fit'
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
        const value = cell.getValue() as string;
        if (!value) return h('span', { class: 'text-foam-300/50' }, '—');
        return h('span', { class: 'text-foam-200/80 text-sm', title: value },
          value.substring(0, 30) + (value.length > 30 ? '...' : '')
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
  <section class="space-y-8">
    <header class="space-y-3">
      <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Administration</p>
      <h1 class="hero-title flex items-center gap-3">
        <span class="rounded-2xl bg-white/5 p-3"><VueIcon name="bs:bar-chart-fill" class="text-accent-300" /></span>
        Niveaux de jeu des joueurs
      </h1>
      <p class="muted">Gérez et consultez les niveaux déclarés</p>
    </header>

    <Card class="glass-panel space-y-4 p-6">
      <div class="flex items-center gap-2 text-sm text-foam-300/80">
        <VueIcon name="bs:funnel" /> Filtres
      </div>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label class="space-y-2 text-sm text-foam-300/70">
          Nom du joueur
          <input v-model="playerNameFilter" type="text" class="form-input mt-1" placeholder="Chercher un joueur..." />
        </label>
        <label class="space-y-2 text-sm text-foam-300/70">
          Jeu
          <ACSSelect v-model="selectedGameFilter" :options="games.map(g => ({ label: g.name, value: g.id }))" class="w-full! bg-surface-700/60! mt-1!" />
        </label>
        <label class="space-y-2 text-sm text-foam-300/70">
          Niveau
          <ACSSelect v-model="selectedLevelFilter" :options="levels.map(l => ({ label: l, value: l }))" class="w-full! bg-surface-700/60! mt-1!" />
        </label>
        <label v-if="selectedGameFilter" class="space-y-2 text-sm text-foam-300/70">
          Tournoi
          <ACSSelect v-model="selectedTournamentFilter" :options="tournaments.map(t => ({ label: t.name, value: t.id }))" class="w-full! bg-surface-700/60! mt-1!" />
        </label>
      </div>
      <div class="flex justify-end">
        <Button variant="ghost" class="gap-2" @click="clearFilters">
          <VueIcon name="bs:x-circle" /> Réinitialiser
        </Button>
      </div>
    </Card>

    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
        <p class="text-sm uppercase tracking-[0.4em] text-foam-300/70">{{ filteredPlayerLevels.length }} niveau(x)</p>
        <div class="h-px flex-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
      </div>
      <Card class="glass-panel p-0">
        <TableTanstack :table="table" :paginated="true" />
      </Card>
    </div>
  </section>
</template>
