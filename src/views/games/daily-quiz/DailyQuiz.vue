<script setup lang="ts">
import useGamesStore from "@/stores/gamesStore.ts";
import {computed, h, onMounted, onUnmounted, ref} from "vue";
import {Avatar, Button, Card} from "@/components/ui";
import {useToastStore} from "@/stores/toastStore.ts";
import {getCoreRowModel, useVueTable} from "@tanstack/vue-table";
import type {WeeklyLeaderboardEntry} from "@/types/models";
import TableTanstack from "@/components/global/TableTanstack.vue";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";

const gamesStore = useGamesStore();

const userAnswer = ref<string>("");
const answerTimeInterval = ref<number | null>(null);
const isAnswerCorrect = ref<boolean | null>(null);

onMounted(async () => {
  await gamesStore.fetchDailyQuestion();
  await gamesStore.fetchYesterdayDailyQuestion();
  await gamesStore.fetchTodayDailyAnswer();
  await gamesStore.fetchWeeklyLeaderboard();

  startAnswerTimer()

  document.addEventListener("visibilitychange", () => {
    if (dailyQuestionAnswered) return;
    if (document.hidden) {
      document.title = "Arrête de tricher ! 🧐";
      if (gamesStore.dailyQuiz.todayAnswer?.discoveredAt) updateAnswer({ cheated: true });
    } else {
      document.title = "ACS | Question du jour"; // Restaurer le titre original
    }
  });
});

onUnmounted(() => {
  if (answerTimeInterval.value) {
    clearInterval(answerTimeInterval.value);
  }
  document.removeEventListener("visibilitychange", () => {});
});

const startAnswerTimer = () => {
  if (gamesStore.dailyQuiz.todayAnswer?.discoveredAt && !gamesStore.dailyQuiz.todayAnswer.answeredAt) {
    const discoveredAt = new Date(gamesStore.dailyQuiz.todayAnswer.discoveredAt).getTime();
    answerTimeInterval.value = window.setInterval(() => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - discoveredAt) / 1000);
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;
      const formattedTime = `${hours > 0 ? `${hours}h` : '' } ${minutes > 0 ? `${minutes}m` : ''} ${seconds}s`;
      const answerTimeElement = document.getElementById("answer-time");
      if (answerTimeElement) {
        answerTimeElement.textContent = formattedTime;
      }
    }, 1000);
  }
}

const updateAnswer = async (answerData: { cheated?: boolean, userAnswer?: string, discoveredAt?: string }) => {
  if (!gamesStore.dailyQuiz.todayQuestion) {
    useToastStore().error("Aucune question du jour disponible.");
    return;
  }
  if (answerData.userAnswer !== undefined && answerData.userAnswer.trim() === "") {
    useToastStore().error("Veuillez entrer une réponse valide.");
    return;
  }
  await gamesStore.updateDailyAnswer(gamesStore.dailyQuiz.todayQuestion.id, answerData)
  if (answerData.userAnswer) {
    if (answerTimeInterval.value) clearInterval(answerTimeInterval.value);
    // Vérifier si la réponse est correcte pour le feedback visuel
    if (gamesStore.dailyQuiz.todayAnswer?.isCorrect !== undefined) {
      isAnswerCorrect.value = gamesStore.dailyQuiz.todayAnswer.isCorrect;
    }
  }
  if (answerData.discoveredAt) startAnswerTimer()
}

const dailyQuestionDiscovered = computed(() => {
  return gamesStore.dailyQuiz.todayQuestion && gamesStore.dailyQuiz.todayAnswer && gamesStore.dailyQuiz.todayAnswer.discoveredAt;
})
const dailyQuestionAnswered = computed(() => {
  return gamesStore.dailyQuiz.todayQuestion && gamesStore.dailyQuiz.todayAnswer && gamesStore.dailyQuiz.todayAnswer.answeredAt;
})
const timeTaken = computed(() => {
  if (gamesStore.dailyQuiz.todayAnswer && gamesStore.dailyQuiz.todayAnswer.answeredAt && gamesStore.dailyQuiz.todayAnswer.discoveredAt) {
    const answeredAt = new Date(gamesStore.dailyQuiz.todayAnswer.answeredAt).getTime();
    const discoveredAt = new Date(gamesStore.dailyQuiz.todayAnswer.discoveredAt).getTime();
    const diffInSeconds = Math.floor((answeredAt - discoveredAt) / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${hours > 0 ? `${hours}h` : '' } ${minutes > 0 ? `${minutes}m` : ''} ${seconds}s`;
  }
  return "00:00:00";
});

const table = useVueTable<WeeklyLeaderboardEntry>({
  get data() {
    return gamesStore.dailyQuiz.leaderboards.weekly as WeeklyLeaderboardEntry[];
  },
  columns: [
    { header: 'Position', cell: ({ row }) => row.index + 1 },
    { header: 'Joueur', accessorKey: 'username', cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [h(Avatar, { src: row.original.avatarUrl, alt: `Avatar de ${row.original.username}`, size: 8 }), row.original.username]) },
    { header: 'Points', accessorKey: 'totalPoints' },
  ],
  getCoreRowModel: getCoreRowModel()
});
</script>

<template>
  <!-- Question du jour -->
  <Card class="p-8 w-full max-w-4xl mx-auto backdrop-blur-xl border border-foam-200/10">
    <div class="flex flex-col gap-8">
      <!-- Entête avec titre et chrono -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="h-1 w-12 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"></div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Question du jour</h1>
        </div>
        <div class="pl-0">
          <p v-if="dailyQuestionDiscovered && !dailyQuestionAnswered" class="text-foam-300 text-sm font-medium flex items-center gap-2">
            <VueIcon name="mdTimeFilled" class="text-emerald-400" size="18" />
            Temps écoulé : <span id="answer-time" class="text-emerald-400 font-semibold">00:00:00</span>
          </p>
          <p v-else-if="dailyQuestionAnswered" class="text-foam-300 text-sm font-medium flex items-center gap-2">
            <VueIcon name="mdCheckCircle" class="text-emerald-400" size="18" />
            Répondu en : <span class="text-emerald-400 font-semibold">{{ timeTaken }}</span>
          </p>
          <p v-else class="text-foam-300 text-sm">
            ✨ Clique sur le bouton ci-dessous pour dévoiler la question du jour. Ton temps de réponse commencera à être calculé.
          </p>
        </div>
      </div>

      <!-- Contenu principal -->
      <div v-if="dailyQuestionDiscovered && !dailyQuestionAnswered" class="space-y-6 flex flex-col animate-in fade-in duration-300">
        <!-- Question -->
        <div class="space-y-4 bg-gradient-to-br from-surface-700/50 to-surface-800/30 border border-foam-200/10 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-foam-100">Quelle est ta réponse ?</h2>
          <p class="text-white text-xl font-medium leading-relaxed">{{ gamesStore.dailyQuiz.todayQuestion?.question }}</p>
        </div>

        <!-- Options de réponse -->
        <div class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="option in gamesStore.dailyQuiz.todayQuestion?.options" :key="option" class="flex items-center cursor-pointer group">
              <input
                type="radio"
                :id="option"
                :value="option"
                v-model="userAnswer"
                class="hidden peer"
              >
              <label
                :for="option"
                class="w-full bg-surface-700/40 hover:bg-surface-700/80 border border-foam-200/10 hover:border-foam-200/30 rounded-lg p-4 transition-all duration-200 text-white cursor-pointer text-center peer-checked:bg-gradient-to-r peer-checked:from-emerald-600/80 peer-checked:to-emerald-500/60 peer-checked:border-emerald-400/50 peer-checked:shadow-lg peer-checked:shadow-emerald-500/20 peer-checked:text-white font-medium group-hover:shadow-md group-hover:shadow-emerald-500/10"
              >
                {{ option }}
              </label>
            </div>
          </div>
        </div>

        <!-- Bouton d'envoi -->
        <div class="pt-4">
          <Button
            :disabled="!userAnswer"
            class="w-full sm:w-auto place-self-end bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            @click="updateAnswer({ userAnswer: userAnswer })"
          >
            <VueIcon name="mdSend" class="mr-2" size="18" />
            Envoyer ma réponse
          </Button>
        </div>
      </div>

      <!-- Résultat de la réponse (après soumission) -->
      <div v-else-if="dailyQuestionAnswered" class="space-y-5 flex flex-col animate-in fade-in duration-300">
        <!-- Question -->
        <div class="space-y-4 bg-gradient-to-br from-surface-700/50 to-surface-800/30 border border-foam-200/10 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-foam-100">Question du jour</h2>
          <p class="text-white text-xl font-medium leading-relaxed">{{ gamesStore.dailyQuiz.todayQuestion?.question }}</p>
        </div>

        <!-- Réponse utilisateur -->
        <div class="space-y-3 bg-surface-700/40 border border-foam-200/10 rounded-xl p-6">
          <h3 class="text-sm font-semibold text-foam-300 uppercase tracking-wider">Ta réponse</h3>
          <p class="text-white text-lg font-medium">{{ gamesStore.dailyQuiz.todayAnswer?.userAnswer }}</p>
        </div>
      </div>

      <!-- État initial (avant de révéler) -->
      <div v-else class="flex flex-1 items-center justify-center py-12">
        <Button
          class="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-8 py-3 text-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
          @click="updateAnswer({ discoveredAt: new Date().toISOString() })"
        >
          <VueIcon name="mdVisibility" class="mr-2" size="20" />
          Voir la question du jour
        </Button>
      </div>
    </div>
  </Card>

  <!-- Résultat de la veille -->
  <Card class="p-8 w-full max-w-4xl mx-auto backdrop-blur-xl border border-foam-200/10">
    <div class="flex flex-col gap-8">
      <!-- Titre -->
      <div class="flex items-center gap-2">
        <div class="h-1 w-12 bg-gradient-to-r from-accent-500 to-accent-400 rounded-full"></div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">Résultat d'hier</h2>
      </div>

      <!-- Contenu -->
      <div v-if="gamesStore.dailyQuiz.yesterdayQuestion && gamesStore.dailyQuiz.yesterdayQuestion" class="space-y-5 flex flex-col">
        <!-- Question d'hier -->
        <div class="space-y-4 bg-gradient-to-br from-surface-700/50 to-surface-800/30 border border-foam-200/10 rounded-xl p-6">
          <h3 class="text-sm font-semibold text-foam-300 uppercase tracking-wider">Question</h3>
          <p class="text-white text-lg font-medium leading-relaxed">{{ gamesStore.dailyQuiz.yesterdayQuestion.question }}</p>
        </div>

        <!-- Réponse donnée -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-surface-700/40 border border-foam-200/10 rounded-xl p-6 space-y-2">
            <h3 class="text-sm font-semibold text-foam-300 uppercase tracking-wider">Ta réponse</h3>
            <p class="text-white text-lg font-medium">{{ gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.userAnswer }}</p>
          </div>

          <!-- Réponse correcte -->
          <div class="bg-emerald-600/10 border border-emerald-500/30 rounded-xl p-6 space-y-2">
            <h3 class="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Réponse correcte</h3>
            <p class="text-emerald-200 text-lg font-medium">{{ gamesStore.dailyQuiz.yesterdayQuestion.correctAnswer }}</p>
          </div>
        </div>

        <!-- Résultat -->
        <div v-if="gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect" class="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <div class="flex items-center gap-3">
            <VueIcon name="mdCheckCircle" class="text-emerald-400" size="24" />
            <div>
              <h4 class="text-lg font-semibold text-emerald-300">Bien joué ! 🎉</h4>
              <p class="text-emerald-200 text-sm mt-1">Tu as gagné <span class="font-bold">+{{ gamesStore.dailyQuiz.yesterdayQuestion.userAnswer.points }} points</span></p>
            </div>
          </div>
        </div>
        <div v-else class="bg-gradient-to-r from-blush-600/20 to-blush-500/10 border border-blush-500/30 rounded-xl p-6">
          <div class="flex items-center gap-3">
            <VueIcon name="mdErrorOutline" class="text-blush-400" size="24" />
            <div>
              <h4 class="text-lg font-semibold text-blush-300">Pas cette fois 😔</h4>
              <p class="text-blush-200 text-sm mt-1">Ce n'était pas la bonne réponse, mais tu vas réussir la prochaine !</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Aucun résultat disponible -->
      <div v-else class="py-12 text-center">
        <VueIcon name="mdAvTimer" class="text-foam-400 mx-auto mb-4" size="32" />
        <p class="text-foam-300">Reviens demain pour voir tes résultats !</p>
      </div>
    </div>
  </Card>

  <!-- Classement de la semaine -->
  <Card class="p-8 w-full max-w-4xl mx-auto backdrop-blur-xl border border-foam-200/10">
    <div class="flex flex-col gap-6">
      <!-- Titre -->
      <div class="flex items-center gap-2">
        <div class="h-1 w-12 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"></div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">Classement de la semaine</h2>
      </div>

      <!-- Tableau -->
      <div class="overflow-hidden rounded-lg border border-foam-200/10">
        <TableTanstack :table="table" paginated />
      </div>
    </div>
  </Card>
</template>