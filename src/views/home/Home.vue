<script setup lang="ts">
import TournamentCard from '@/components/global/TournamentCard.vue';
import {Badge, Button, Card} from '@/components/ui';
import useHomeStore from '@/stores/homeStore.ts';
import {useUserStore} from '@/stores/userStore';
import {API_URL} from '@/utils';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {computed, onMounted} from 'vue';

const userStore = useUserStore();
const homeStore = useHomeStore();

const homeStats = computed(() => homeStore.homeStats);
const lastFinishedTournament = computed(() => homeStore.lastTournament ?? null);
const currentTournament = computed(() => homeStore.currentTournament ?? null);
const nextTournaments = computed(() => homeStore.nextTournaments);
const ctaLabel = computed(() => userStore.isLoggedIn ? 'Explorer les tournois' : 'Rejoindre Discord');
const ctaLink = computed(() => userStore.isLoggedIn ? '/tournaments' : `${API_URL}/auth/discord`);

onMounted(() => {
  homeStore.fetchHomeStats()
  homeStore.fetchNextTournaments()
  homeStore.fetchLastTournament()
  homeStore.fetchCurrentTournament()
})
</script>

<template>
  <div class="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] relative">
    <!-- Colonne gauche : Hero + Tournoi clôturé -->
    <div class="space-y-8 flex flex-col xl:sticky xl:top-5 xl:self-start">
      <!-- Section supérieure : Programme hebdomadaire -->
      <section>
        <Card class="relative overflow-hidden p-8 border-2 border-accent-400/20 hover:border-accent-400/40 transition-all duration-500 hover:shadow-[0_0_60px_rgba(123,109,255,0.25)]">
          <!-- Orbes d'ambiance en arrière-plan -->
          <div class="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blush-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <template #header>
            <div class="space-y-5 relative z-10">
              <Badge tone="neutral" size="sm" class="backdrop-blur-sm">Programme hebdomadaire</Badge>
              <div>
                <p class="text-sm uppercase tracking-[0.4em] text-foam-200/60 font-semibold">Plateforme tournois ACS</p>
                <h1 class="hero-title mt-3 max-w-3xl bg-gradient-to-br from-foam-50 via-accent-200 to-blush-300 bg-clip-text text-transparent">
                  Alors ça Scrim ?
                </h1>
                <p class="mt-3 text-foam-300/80 text-lg max-w-2xl">
                  Rejoignez la communauté gaming et participez aux tournois hebdomadaires
                </p>
              </div>
            </div>
          </template>

          <div class="mt-8 flex flex-wrap gap-4 relative z-10">
            <Button :to="ctaLink" class="gap-3 shadow-lg hover:shadow-accent-500/20 hover:shadow-2xl transition-all duration-300" variant="primary">
              <template #icon>
                <VueIcon :name="userStore.isLoggedIn ? 'bs:trophy' : 'bs:discord'" class="text-xl" />
              </template>
              {{ ctaLabel }}
            </Button>
            <Button to="/leaderboard" variant="ghost" class="gap-2 hover:bg-white/10 transition-all">
              <template #icon>
                <VueIcon name="ic:leaderboard-star" />
              </template>
              Voir le classement
            </Button>
          </div>

          <div class="mt-12 grid grid-cols-2 gap-5 xl:grid-cols-3 relative z-10">
            <div class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 hover:from-accent-500/10 hover:to-accent-500/5 hover:border-accent-400/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(123,109,255,0.15)] hover:-translate-y-1">
              <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60 font-semibold mb-2">Tournois</p>
              <p class="text-4xl font-bold bg-gradient-to-br from-foam-50 to-accent-200 bg-clip-text text-transparent">{{ homeStats.tournaments }}</p>
            </div>
            <div class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 hover:from-emerald-500/10 hover:to-emerald-500/5 hover:border-emerald-400/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,220,180,0.15)] hover:-translate-y-1">
              <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60 font-semibold mb-2">Joueurs</p>
              <p class="text-4xl font-bold bg-gradient-to-br from-foam-50 to-emerald-200 bg-clip-text text-transparent">{{ homeStats.users }}</p>
            </div>
            <div class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 hover:from-blush-500/10 hover:to-blush-500/5 hover:border-blush-400/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,95,143,0.15)] hover:-translate-y-1 col-span-2 xl:col-span-1">
              <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60 font-semibold mb-2">Jeux</p>
              <p class="text-4xl font-bold bg-gradient-to-br from-foam-50 to-blush-200 bg-clip-text text-transparent">{{ homeStats.gamesPlayed }}</p>
            </div>
          </div>
        </Card>
      </section>

      <!-- Section tournoi en cours -->
      <section v-if="currentTournament" class="xl:flex flex-col space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60 font-semibold">En direct</p>
            <h3 class="text-2xl font-bold text-white/90 font-display">Tournoi en cours</h3>
          </div>
          <Badge tone="emerald" size="sm" class="animate-pulse shadow-[0_0_15px_rgba(20,220,180,0.4)]">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute"></span>
              <span class="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Live
            </span>
          </Badge>
        </div>
        <RouterLink :to="`/tournaments/${currentTournament.id}`" class="block hover:scale-[1.02] transition-transform duration-300">
          <TournamentCard :tournament="currentTournament" class="hover:shadow-[0_0_40px_rgba(20,220,180,0.2)]" />
        </RouterLink>
      </section>

      <!-- Section inférieure : Tournoi clôturé (masqué sur mobile) -->
      <section class="xl:flex flex-col space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60 font-semibold">Dernier highlight</p>
            <h3 class="text-2xl font-bold text-white/90 font-display">Tournoi clôturé</h3>
          </div>
          <Badge tone="accent" size="sm" class="shadow-[0_0_15px_rgba(123,109,255,0.3)]">Recap</Badge>
        </div>
        <RouterLink v-if="lastFinishedTournament" :to="`/tournaments/${lastFinishedTournament.id}`" class="block hover:scale-[1.02] transition-transform duration-300">
          <TournamentCard :tournament="lastFinishedTournament" class="hover:shadow-[0_0_40px_rgba(123,109,255,0.2)]" />
        </RouterLink>
        <Card v-else class="p-8 text-center text-foam-300/70 border-dashed border-2">
          <VueIcon name="bs:trophy" class="text-4xl mb-2 opacity-30" />
          <p>Aucun tournoi terminé récemment.</p>
        </Card>
      </section>
    </div>

    <!-- Colonne droite : Prochains tournois -->
    <div class="space-y-5 flex flex-col">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60 font-semibold">Prochains tournois</p>
          <h3 class="text-2xl font-bold text-white/90 font-display">À venir</h3>
        </div>
        <Badge v-if="nextTournaments.length > 0" tone="neutral" size="sm">{{ nextTournaments.length }}</Badge>
      </div>

      <!-- Tournoi principal (le plus proche) -->
      <div v-if="nextTournaments.length > 0 && nextTournaments[0]" class="min-h-0">
        <RouterLink :to="`/tournaments/${nextTournaments[0].id}`" class="block hover:scale-[1.02] transition-transform duration-300">
          <TournamentCard :tournament="nextTournaments[0]" class="h-full border-2 border-accent-400/20 hover:border-accent-400/40 hover:shadow-[0_0_40px_rgba(123,109,255,0.2)]" />
        </RouterLink>
      </div>

      <!-- 2 tournois suivants en colonne (masqués sur mobile) -->
      <div v-if="nextTournaments.length > 1" class="xl:flex space-y-5 xl:flex-col">
        <RouterLink
          v-for="(tournament, index) in nextTournaments.slice(1, 3)"
          :key="tournament.id"
          :to="`/tournaments/${tournament.id}`"
          class="flex hover:scale-[1.02] transition-transform duration-300"
          :style="{ transitionDelay: `${index * 50}ms` }"
        >
          <TournamentCard :tournament="tournament" class="h-full w-full hover:shadow-[0_0_30px_rgba(123,109,255,0.15)]" />
        </RouterLink>
      </div>

      <!-- Message si aucun tournoi -->
      <Card v-if="nextTournaments.length === 0" class="p-12 text-center text-foam-300/70 border-dashed border-2">
        <VueIcon name="bs:calendar-x" class="text-5xl mb-4 opacity-30" />
        <p class="text-lg">Aucun tournoi à venir pour le moment.</p>
        <p class="text-sm mt-2 opacity-60">Revenez bientôt !</p>
      </Card>
    </div>
  </div>
</template>
