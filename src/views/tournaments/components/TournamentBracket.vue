<script setup lang="ts">
import {Button, Card} from '@/components/ui';
import type {ChallongeMatch, Tournament} from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {computed, onMounted, reactive, ref} from 'vue';
import useTournamentStore from "@/stores/tournamentStore.ts";
import ListView from "@/components/global/ListView.vue";
import {whenever} from "@vueuse/core";
import {useToastStore} from "@/stores/toastStore.ts";
import {useUserStore} from "@/stores/userStore.ts";

const props = defineProps<{ tournament: Tournament }>();

const userStore = useUserStore();
const tournamentStore = useTournamentStore();
const matches = ref<ChallongeMatch[]>([]);

const hasBracket = computed(() => !!props.tournament.challongeUrl);

const formState = reactive<Record<string, { winner: string; amount: number }>>({});

const fetchMatches = async () => {
  matches.value = await tournamentStore.fetchBracketMatches(props.tournament.id);
};

onMounted(async () => {
  await fetchMatches();
});
whenever(matches, () => {
  matches.value.forEach(match => initMatchForm(match));
});

const initMatchForm = (match: ChallongeMatch) => {
  const defaults = {
    winner: match.bet?.predictedWinner || '',
    amount: match.bet?.amount || 0
  }
  formState[match.id] = { ...defaults };
};

const handleBetSubmit = async (e: SubmitEvent, matchId: string) => {
  const { winner, amount } = formState[matchId] || { winner: '', amount: 0 };

  formState[matchId] = { winner: '', amount: 0 };

  if (!winner || !amount) {
    useToastStore().error('Veuillez sélectionner un joueur et entrer un montant.');
    return;
  }

  try {
    await tournamentStore.placeBet(props.tournament.id, matchId, winner, amount);
    useToastStore().success('Prédiction placée avec succès !');
  } catch (error) {
    useToastStore().error('Erreur lors de la placement de la prédiction.');
  } finally {
    await fetchMatches();
  }
};

const handleCancelBet = async (tournamentId: string, matchId: string) => {
  try {
    formState[matchId] = { winner: '', amount: 0 };
    await tournamentStore.cancelBet(tournamentId, matchId);
  } catch (error) {
    useToastStore().error('Erreur lors de l\'annulation de la prédiction.');
  } finally {
    await fetchMatches();
    matches.value.forEach(match => initMatchForm(match));
  }
};

const handleBetValidation = async (tournamentId: string) => {
  try {
    await tournamentStore.validateBets(tournamentId);
    useToastStore().success('Validation des prédictions lancée avec succès !');
  } catch (error) {
    useToastStore().error('Erreur lors de la validation des prédictions.');
  } finally {
    await fetchMatches();
  }
};
</script>

<template>
  <div v-if="hasBracket" class="space-y-4">
    <Card class="glass-panel p-6">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70 mb-2">Bracket</p>
          <h2 class="text-2xl font-bold text-white">Bracket du tournoi</h2>
        </div>
        <a 
          :href="tournament.challongeUrl" 
          target="_blank"
          class="px-4 py-2 bg-gradient-to-br from-accent-500 to-emerald-400 text-ink-900 font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <VueIcon name="bs:box-arrow-up-right" />
          Voir sur Challonge
        </a>
      </div>

      <!-- Bracket iframe -->
      <div class="bracket-container">
        <iframe 
          :src="tournament.challongeUrl + '/module'"
          class="absolute top-0 left-0 w-full h-full rounded-lg border-0 bg-ink-900/30"
          scrolling="auto"
        ></iframe>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-white">Prédictions</h2>
          <Button v-if="userStore.user?.role.includes('admin')" variant="emerald" title="Les prédictions des matchs terminés seront validées automatiquement." @click="handleBetValidation(tournament.id)">
            Valider les prédictions
          </Button>
        </div>
        <ListView
          :data="matches"
          :maxCols="2"
        >
          <template #item="{ item: match }">
            <Card class="glass-panel p-4">
              <form class="flex flex-col items-center gap-4 p-4 w-full" @submit.prevent="(e) => handleBetSubmit(e, match.id)">
                <fieldset class="flex items-center gap-4 w-full">
                  <legend class="form-label pb-2">Choix du vainqueur</legend>
                  <div class="flex items-center w-full">
                    <input
                      type="radio"
                      :id="`match-${match.id}-${match.player1}`"
                      :name="`match-${match.id}`"
                      :value="match.player1"
                      v-model="formState[match.id]!.winner"
                      class="peer hidden"
                      :disabled="match.isStarted || match.isCompleted || !!match.bet"
                    />
                    <label
                      :for="`match-${match.id}-${match.player1}`"
                      class="text-center w-full gap-2 rounded-lg border px-3 py-2 transition peer-checked:bg-accent-200 peer-checked:text-ink-900"
                      :class="{ 'cursor-not-allowed opacity-50': match.isStarted || match.isCompleted || !!match.bet }"
                    >
                      {{ match.player1 }}
                    </label>
                  </div>

                  <div class="flex items-center w-full">
                    <input
                      type="radio"
                      :id="`match-${match.id}-${match.player2}`"
                      :name="`match-${match.id}`"
                      :value="match.player2"
                      v-model="formState[match.id]!.winner"
                      class="peer hidden"
                      :disabled="match.isStarted || match.isCompleted || !!match.bet"
                    />
                    <label
                      :for="`match-${match.id}-${match.player2}`"
                      class="text-center w-full gap-2 rounded-lg border px-3 py-2 transition peer-checked:bg-accent-200 peer-checked:text-ink-900"
                      :class="{ 'cursor-not-allowed opacity-50': match.isStarted || match.isCompleted || !!match.bet }"
                    >
                      {{ match.player2 }}
                    </label>
                  </div>
                </fieldset>
                <div class="w-full">
                  <label class="form-label" :for="`match-${match.id}-bet-amount`">Montant</label>
                  <input type="number" :disabled="match.isStarted || match.isCompleted || !!match.bet" class="form-input" :class="{ 'cursor-not-allowed opacity-50': match.isStarted || match.isCompleted || !!match.bet }" :id="`match-${match.id}-bet-amount`" :name="`match-${match.id}-bet-amount`" v-model.number="formState[match.id]!.amount" />
                </div>
                <div class="flex items-center justify-center w-full gap-2">
                  <Button :disabled="match.isStarted || match.isCompleted || !!match.bet">
                    <span v-if="!match.isStarted && !match.isCompleted && !match.bet">Placer la prédiction</span>
                    <span v-if="match.isStarted && !match.isCompleted">Match en cours</span>
                    <span v-if="match.isStarted && match.isCompleted && match.bet && !match.bet.isProcessed">Attente de validation</span>
                    <span v-if="match.isCompleted && match.bet && match.bet.isProcessed && match.bet.won" class="flex items-center gap-1">Gagné ! +{{ match.bet.amount * 2 }}<img src="/scrimium.svg" alt="Scrimium" class="size-5" /></span>
                    <span v-if="match.isCompleted && match.bet && match.bet.isProcessed && !match.bet.won" class="flex items-center gap-1">Perdu ! -{{ match.bet.amount }}<img src="/scrimium.svg" alt="Scrimium" class="size-5" /></span>
                    <span v-if="match.isStarted && match.isCompleted && !match.bet">Pas de prédiction</span>
                    <span v-if="!match.isStarted && !match.isCompleted && !!match.bet">En attente du match</span>
                  </Button>
                  <Button type="button" variant="ghost" class="px-1" title="Annuler la prédiction" v-if="!match.isStarted && !match.isCompleted && !!match.bet" @click="handleCancelBet(tournament.id, match.id)">
                    <VueIcon name="fa:x" color="red" />
                  </Button>
                </div>
              </form>
            </Card>
          </template>
        </ListView>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.bracket-container {
  @apply relative w-full;
  padding-bottom: 56.25%; /* 16:9 aspect ratio for iframe */
}
</style>
