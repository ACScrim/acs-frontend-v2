<script setup lang="ts">
import TournamentCard from '@/components/global/TournamentCard.vue';
import { Button, Card, Badge } from '@/components/ui';
import useStatsStore from '@/stores/statsStore';
import useTournamentStore from '@/stores/tournamentStore';
import { useUserStore } from '@/stores/userStore';
import { API_URL } from '@/utils';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';

const userStore = useUserStore();
const statsStore = useStatsStore();
const tournamentStore = useTournamentStore();

const homeStats = computed(() => statsStore.homeStats);
const lastFinishedTournament = computed(() => tournamentStore.finishedTournaments[0] ?? null);
const ctaLabel = computed(() => userStore.isLoggedIn ? 'Explorer les tournois' : 'Rejoindre Discord');
const ctaLink = computed(() => userStore.isLoggedIn ? '/tournaments' : `${API_URL}/auth/discord`);
</script>

<template>
  <section class="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <Card class="relative overflow-hidden p-6">
      <template #header>
        <div class="space-y-4">
          <Badge tone="neutral" size="sm">Programme hebdomadaire</Badge>
          <div>
            <p class="text-sm uppercase tracking-[0.4em] text-foam-200/60">Plateforme tournois ACS</p>
            <h1 class="hero-title mt-2 max-w-3xl">Inscris-toi, joue, progresse chaque semaine</h1>
          </div>
        </div>
      </template>

      <p class="muted max-w-2xl text-base leading-relaxed">
        Créée pour les joueurs qui veulent affronter le meilleur niveau dans une ambiance premium. Tournois calibrés, matchmaking fin, stats en temps réel.
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <Button :to="ctaLink" class="gap-3" variant="primary">
          <template #icon>
            <VueIcon :name="userStore.isLoggedIn ? 'bs:trophy' : 'bs:discord'" class="text-xl" />
          </template>
          {{ ctaLabel }}
        </Button>
        <Button to="/leaderboard" variant="ghost" class="gap-2">
          <template #icon>
            <VueIcon name="ic:leaderboard-star" />
          </template>
          Voir le classement
        </Button>
      </div>

      <div class="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-sm uppercase tracking-[0.4em] text-foam-300/60">Tournois</p>
          <p class="text-3xl font-semibold">{{ homeStats.tournaments }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-sm uppercase tracking-[0.4em] text-foam-300/60">Joueurs</p>
          <p class="text-3xl font-semibold">{{ homeStats.users }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-sm uppercase tracking-[0.4em] text-foam-300/60">Jeux</p>
          <p class="text-3xl font-semibold">{{ homeStats.gamesPlayed }}</p>
        </div>
      </div>
    </Card>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Dernier highlight</p>
          <h3 class="text-lg font-semibold text-white/90">Tournoi clôturé</h3>
        </div>
        <Badge tone="accent" size="sm">Recap</Badge>
      </div>
      <RouterLink v-if="lastFinishedTournament" :to="`/tournaments/${lastFinishedTournament.id}`">
        <TournamentCard :tournament="lastFinishedTournament" />
      </RouterLink>
      <Card v-else class="p-8 text-center text-foam-300/70">
        Aucun tournoi terminé récemment.
      </Card>
    </div>
  </section>
</template>
