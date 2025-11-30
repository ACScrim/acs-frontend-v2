<script setup lang="ts">
import useGamesStore from "@/stores/gamesStore.ts";
import {computed, h, onMounted, onUnmounted, ref} from "vue";
import {Avatar, Button, Card} from "@/components/ui";
import {useToastStore} from "@/stores/toastStore.ts";
import {getCoreRowModel, useVueTable} from "@tanstack/vue-table";
import type {WeeklyLeaderboardEntry} from "@/types/models";
import TableTanstack from "@/components/global/TableTanstack.vue";

const gamesStore = useGamesStore();

const userAnswer = ref<string>("");
const answerTimeInterval = ref<number | null>(null);

onMounted(async () => {
  await gamesStore.fetchDailyQuestion();
  await gamesStore.fetchYesterdayDailyQuestion();
  await gamesStore.fetchTodayDailyAnswer();
  await gamesStore.fetchWeeklyLeaderboard();

  startAnswerTimer()

  document.addEventListener("visibilitychange", () => {
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

const updateAnswer = async (answerData: { useHint?: boolean, cheated?: boolean, userAnswer?: string, discoveredAt?: string }) => {
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
  }
  if (answerData.discoveredAt) startAnswerTimer()
  if (answerData.useHint) await gamesStore.fetchDailyQuestion();
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
  <Card class="p-6 w-full max-w-3xl mx-auto">
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold text-white mb-4">Question du jour</h1>
        <p v-if="dailyQuestionDiscovered && !dailyQuestionAnswered" class="text-white/70">Ton temps de réponse : <span id="answer-time"></span></p>
        <p v-else-if="dailyQuestionAnswered" class="text-white/70">Ton temps de réponse : {{ timeTaken }}</p>
        <p v-else class="text-white/70">Clique sur le bouton ci-dessous pour dévoiler la question du jour ! <br />Ton temps de réponse commencera à être calculer quand tu auras dévoilé la question !</p>
      </div>
      <div v-if="dailyQuestionDiscovered && !dailyQuestionAnswered" class="space-y-4 flex flex-col">
        <h2 class="text-xl font-semibold text-white">Question du jour :</h2>
        <p class="text-white text-lg">{{ gamesStore.dailyQuiz.todayQuestion?.question }}</p>
        <div class="flex flex-col gap-2">
          <label class="text-white font-semibold">Ta réponse :</label>
          <div v-if="!gamesStore.dailyQuiz.todayAnswer?.useHint" class="flex flex-row gap-2">
            <input class="form-input" type="text" v-model="userAnswer" />
            <Button @click="updateAnswer({ useHint: true })">
              Indice
            </Button>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="option in gamesStore.dailyQuiz.todayQuestion!.options" :key="option" class="flex items-center cursor-pointer">
              <input
                  type="radio"
                  name="todayQuestionOptions"
                  :id="option"
                  :value="option"
                  v-model="userAnswer"
                  class="hidden peer"
              >
              <label
                  :for="option"
                  class="w-full bg-white/10 hover:bg-white/20 rounded-lg p-4 transition text-white cursor-pointer text-center peer-checked:bg-gradient-to-r peer-checked:from-emerald-600 peer-checked:to-emerald-400 peer-checked:text-ink-900 peer-checked:shadow-soft peer-checked:hover:brightness-110"
              >
                {{ option }}
              </label>
            </div>
          </div>
        </div>
        <Button class="place-self-end" @click="updateAnswer({ userAnswer: userAnswer })">
          Soumettre ma réponse
        </Button>
      </div>
      <div v-else-if="dailyQuestionAnswered" class="space-y-4 flex flex-col">
        <h2 class="text-xl font-semibold text-white">Question du jour :</h2>
        <p class="text-white text-lg">{{ gamesStore.dailyQuiz.todayQuestion?.question }}</p>
        <h3 class="text-lg font-semibold text-white">Ta réponse :</h3>
        <p class="text-white text-lg">{{ gamesStore.dailyQuiz.todayAnswer?.userAnswer }}</p>
      </div>
      <div v-else class="flex flex-1 items-center justify-center">
        <Button @click="updateAnswer({ discoveredAt: new Date().toISOString() })">
          Voir la question du jour
        </Button>
      </div>
    </div>
  </Card>
  <!-- Résultat de la veille -->
  <Card class="p-6 w-full max-w-3xl mx-auto">
    <div class="flex flex-col gap-6">
      <h2 class="text-2xl font-bold text-white mb-4">Résultat d'hier</h2>
      <div v-if="gamesStore.dailyQuiz.yesterdayQuestion && gamesStore.dailyQuiz.yesterdayQuestion" class="space-y-4 flex flex-col">
        <h3 class="text-xl font-semibold text-white">Question :</h3>
        <p class="text-white text-lg">{{ gamesStore.dailyQuiz.yesterdayQuestion.question }}</p>
        <h3 class="text-lg font-semibold text-white">Ta réponse :</h3>
        <p class="text-white text-lg">{{ gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.userAnswer }}</p>
        <h3 class="text-lg font-semibold text-white">Réponse correcte :</h3>
        <p class="text-white text-lg">{{ gamesStore.dailyQuiz.yesterdayQuestion.correctAnswer }}</p>
        <p v-if="gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect" class="text-emerald-400 font-semibold">Félicitations ! Ta réponse est correcte. (+{{ gamesStore.dailyQuiz.yesterdayQuestion.userAnswer.points }} points)</p>
        <p v-else class="text-blush-400 font-semibold">Dommage ! Ta réponse est incorrecte.</p>
      </div>
      <div v-else class="text-white/70">
        Reviens demain pour voir tes résultats !
      </div>
    </div>
  </Card>
  <!-- Classement -->
  <Card class="p-6 w-full max-w-3xl mx-auto">
    <div class="flex flex-col gap-6 mb-4">
      <h2 class="text-2xl font-bold text-white">Classement de la semaine</h2>
    </div>
    <TableTanstack :table="table" paginated />
  </Card>
</template>