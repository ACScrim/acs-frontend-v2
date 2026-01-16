<script setup lang="ts">
import useGamesStore from "@/stores/gamesStore.ts";
import {computed, h, onMounted, onUnmounted, ref} from "vue";
import {Avatar, Button, Card} from "@/components/ui";
import {useToastStore} from "@/stores/toastStore.ts";
import {getCoreRowModel, useVueTable} from "@tanstack/vue-table";
import type {WeeklyLeaderboardEntry} from "@/types/models";
import TableTanstack from "@/components/global/TableTanstack.vue";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import {shuffleArray} from "@/utils";

const activeTab = ref<"today" | "yesterday" | "leaderboard">("today");

const gamesStore = useGamesStore();

const userAnswer = ref<string>("");
const answerTimeInterval = ref<number | null>(null);
const isAnswerCorrect = ref<boolean | null>(null);

onMounted(async () => {
  await gamesStore.fetchDailyQuestion();
  await gamesStore.fetchYesterdayDailyQuestion();
  await gamesStore.fetchTodayDailyAnswer();
  await gamesStore.fetchWeeklyLeaderboard();

  startAnswerTimer();

  document.addEventListener("visibilitychange", () => {
    if (dailyQuestionAnswered) return;
    if (document.hidden) {
      document.title = "Arrête de tricher ! 🧐";
      if (gamesStore.dailyQuiz.todayAnswer?.discoveredAt)
        updateAnswer({ cheated: true });
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
  if (
    gamesStore.dailyQuiz.todayAnswer?.discoveredAt &&
    !gamesStore.dailyQuiz.todayAnswer.answeredAt
  ) {
    const discoveredAt = new Date(
      gamesStore.dailyQuiz.todayAnswer.discoveredAt
    ).getTime();
    answerTimeInterval.value = window.setInterval(() => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - discoveredAt) / 1000);
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;
      const formattedTime = `${hours > 0 ? `${hours}h` : ""} ${
        minutes > 0 ? `${minutes}m` : ""
      } ${seconds}s`;
      const answerTimeElement = document.getElementById("answer-time");
      if (answerTimeElement) {
        answerTimeElement.textContent = formattedTime;
      }
    }, 1000);
  }
};

const updateAnswer = async (answerData: {
  cheated?: boolean;
  userAnswer?: string;
  discoveredAt?: string;
}) => {
  if (!gamesStore.dailyQuiz.todayQuestion) {
    useToastStore().error("Aucune question du jour disponible.");
    return;
  }
  if (
    answerData.userAnswer !== undefined &&
    answerData.userAnswer.trim() === ""
  ) {
    useToastStore().error("Veuillez entrer une réponse valide.");
    return;
  }
  await gamesStore.updateDailyAnswer(
    gamesStore.dailyQuiz.todayQuestion.id,
    answerData
  );
  if (answerData.userAnswer) {
    if (answerTimeInterval.value) clearInterval(answerTimeInterval.value);
    // Vérifier si la réponse est correcte pour le feedback visuel
    if (gamesStore.dailyQuiz.todayAnswer?.isCorrect !== undefined) {
      isAnswerCorrect.value = gamesStore.dailyQuiz.todayAnswer.isCorrect;
    }
  }
  if (answerData.discoveredAt) startAnswerTimer();
};

const dailyQuestionDiscovered = computed(() => {
  return (
    gamesStore.dailyQuiz.todayQuestion &&
    gamesStore.dailyQuiz.todayAnswer &&
    gamesStore.dailyQuiz.todayAnswer.discoveredAt
  );
});
const dailyQuestionAnswered = computed(() => {
  return (
    gamesStore.dailyQuiz.todayQuestion &&
    gamesStore.dailyQuiz.todayAnswer &&
    gamesStore.dailyQuiz.todayAnswer.answeredAt
  );
});
const timeTaken = computed(() => {
  if (
    gamesStore.dailyQuiz.todayAnswer &&
    gamesStore.dailyQuiz.todayAnswer.answeredAt &&
    gamesStore.dailyQuiz.todayAnswer.discoveredAt
  ) {
    const answeredAt = new Date(
      gamesStore.dailyQuiz.todayAnswer.answeredAt
    ).getTime();
    const discoveredAt = new Date(
      gamesStore.dailyQuiz.todayAnswer.discoveredAt
    ).getTime();
    const diffInSeconds = Math.floor((answeredAt - discoveredAt) / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${hours > 0 ? `${hours}h` : ""} ${
      minutes > 0 ? `${minutes}m` : ""
    } ${seconds}s`;
  }
  return "00:00:00";
});

const table = useVueTable<WeeklyLeaderboardEntry>({
  get data() {
    return gamesStore.dailyQuiz.leaderboards.weekly as WeeklyLeaderboardEntry[];
  },
  columns: [
    { header: "Position", cell: ({ row }) => row.index + 1 },
    {
      header: "Joueur",
      accessorKey: "username",
      cell: ({ row }) =>
        h("div", { class: "flex items-center gap-3" }, [
          h(Avatar, {
            src: row.original.avatarUrl,
            alt: `Avatar de ${row.original.username}`,
            size: 8,
          }),
          row.original.username,
        ]),
    },
    { header: "Points", accessorKey: "totalPoints" },
  ],
  getCoreRowModel: getCoreRowModel(),
  enableSorting: false,
});

const shuffledOptions = computed(() => {
  if (gamesStore.dailyQuiz.todayQuestion) {
    return shuffleArray(gamesStore.dailyQuiz.todayQuestion.options);
  }
  return [];
});
</script>

<template>
  <div class="w-full max-w-6xl mx-auto space-y-6">
    <!-- Header avec titre principal -->
    <div class="text-center space-y-3 mb-8">
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-azure-400 to-accent-400 bg-clip-text text-transparent"
      >
        Quiz Quotidien
      </h1>
      <p class="text-foam-300 text-lg">Teste tes connaissances chaque jour !</p>
    </div>

    <!-- Système d'onglets -->
    <div class="flex justify-center mb-8">
      <div
        class="bg-surface-800/50 rounded-xl p-1 border border-foam-200/10 flex w-full max-w-2xl gap-1"
      >
        <Button
          @click="activeTab = 'today'"
          :variant="activeTab === 'today' ? 'primary' : 'ghost'"
          class="flex-1 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <VueIcon name="md:today" size="18" />
          Aujourd'hui
        </Button>

        <Button
          @click="activeTab = 'yesterday'"
          :variant="activeTab === 'yesterday' ? 'secondary' : 'ghost'"
          class="flex-1 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <VueIcon name="md:calendar-today" size="18" />
          Hier
        </Button>

        <Button
          @click="activeTab = 'leaderboard'"
          :variant="activeTab === 'leaderboard' ? 'outline' : 'ghost'"
          class="flex-1 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <VueIcon name="md:leaderboard" size="18" />
          Classement
        </Button>
      </div>
    </div>

    <!-- Contenu des onglets -->
    <div class="min-h-[500px]">
      <!-- Onglet Question d'aujourd'hui -->
      <Card
        v-if="activeTab === 'today'"
        class="p-8 backdrop-blur-xl border border-foam-200/10 animate-in fade-in duration-300"
      >
        <div class="space-y-8">
          <!-- Status et timer -->
          <div
            class="bg-gradient-to-r from-emerald-500/10 to-azure-500/10 border border-emerald-200/20 rounded-xl p-6"
          >
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <h2 class="text-xl font-bold text-white">Question du jour</h2>
                <p
                  v-if="dailyQuestionDiscovered && !dailyQuestionAnswered"
                  class="text-emerald-300 font-medium flex items-center gap-2"
                >
                  <VueIcon
                    name="md:sharp-access-time-filled"
                    class="text-emerald-400"
                    size="18"
                  />
                  Temps écoulé :
                  <span id="answer-time" class="text-emerald-400 font-bold"
                    >00:00:00</span
                  >
                </p>
                <p
                  v-else-if="dailyQuestionAnswered"
                  class="text-emerald-300 font-medium flex items-center gap-2"
                >
                  <VueIcon
                    name="md:sharp-check-circle"
                    class="text-emerald-400"
                    size="18"
                  />
                  Répondu en :
                  <span class="text-emerald-400 font-bold">{{
                    timeTaken
                  }}</span>
                </p>
                <p v-else class="text-foam-300">
                  ✨ Prêt pour le défi du jour ?
                </p>
              </div>

              <VueIcon v-if="dailyQuestionAnswered" name="md:sharp-check-circle" class="text-emerald-400" size="32" />
              <VueIcon v-else-if="dailyQuestionDiscovered" name="md:sharp-access-time-filled" class="text-amber-400" size="32" />
              <VueIcon v-else name="md:visibility" class="text-azure-400" size="32" />
            </div>
          </div>

          <!-- État initial -->
          <div v-if="!dailyQuestionDiscovered" class="text-center py-16">
            <div class="space-y-6">
              <div
                class="w-24 h-24 bg-gradient-to-br from-emerald-400 to-azure-400 rounded-full flex items-center justify-center mx-auto"
              >
                <VueIcon name="md:quiz" class="text-white" size="48" />
              </div>
              <div class="space-y-3">
                <h3 class="text-2xl font-bold text-white">
                  Découvre la question du jour
                </h3>
                <p class="text-foam-300 max-w-md mx-auto">
                  Une nouvelle question t'attend ! Ton chrono commencera dès que
                  tu la dévoileras.
                </p>
              </div>
              <Button
                class="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-8 py-4 text-lg shadow-xl shadow-emerald-500/25"
                @click="
                  updateAnswer({ discoveredAt: new Date().toISOString() })
                "
              >
                <VueIcon name="md:visibility" class="mr-3" size="20" />
                Dévoiler la question
              </Button>
            </div>
          </div>

          <!-- Question en cours -->
          <div v-else-if="!dailyQuestionAnswered" class="space-y-8">
            <!-- Question -->
            <div
              class="bg-gradient-to-br from-surface-700/60 to-surface-800/40 border border-foam-200/10 rounded-2xl p-8"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-2 h-8 bg-gradient-to-b from-azure-400 to-azure-500 rounded-full"
                ></div>
                <span class="text-azure-300 font-semibold text-lg">{{
                  gamesStore.dailyQuiz.todayQuestion?.category
                }}</span>
              </div>
              <h3 class="text-white text-2xl font-bold leading-relaxed mb-6">
                {{ gamesStore.dailyQuiz.todayQuestion?.question }}
              </h3>
              <img
                v-if="gamesStore.dailyQuiz.todayQuestion?.image"
                :src="gamesStore.dailyQuiz.todayQuestion?.image"
                :alt="`Image pour la question du jour : ${gamesStore.dailyQuiz.todayQuestion?.question}`"
                class="w-full object-contain rounded-xl shadow-lg"
                :class="{
                  'max-h-72':
                    gamesStore.dailyQuiz.todayQuestion?.category === 'Pokémon',
                }"
              />
            </div>

            <!-- Options -->
            <div class="space-y-4">
              <h4 class="text-white font-semibold text-lg">
                Choisir une réponse :
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="option in shuffledOptions"
                  :key="option"
                  class="group"
                >
                  <input
                    type="radio"
                    :id="option"
                    :value="option"
                    v-model="userAnswer"
                    class="hidden peer"
                  />
                  <label
                    :for="option"
                    class="w-full bg-surface-700/50 hover:bg-surface-600/70 border-2 border-foam-200/10 hover:border-emerald-400/40 rounded-xl p-6 transition-all duration-200 text-white cursor-pointer flex items-center gap-4 peer-checked:bg-gradient-to-r peer-checked:from-emerald-600/30 peer-checked:to-emerald-500/20 peer-checked:border-emerald-400/60 peer-checked:shadow-lg peer-checked:shadow-emerald-500/20 hover:scale-[1.02]"
                  >
                    <div
                      :class="[
                        'w-6 h-6 rounded-full border-2 transition-all duration-200',
                        userAnswer === option
                          ? 'bg-emerald-500 border-emerald-400'
                          : 'border-foam-200/30 group-hover:border-emerald-400/60',
                      ]"
                    >
                      <VueIcon
                        v-if="userAnswer === option"
                        name="md:sharp-check"
                        class="text-white w-full h-full"
                        size="16"
                      />
                    </div>
                    <span class="font-medium text-lg">{{ option }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Bouton validation -->
            <div class="flex justify-center pt-4">
              <Button
                :disabled="!userAnswer"
                class="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-surface-600 disabled:to-surface-600 text-white font-bold px-12 py-4 text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                @click="updateAnswer({ userAnswer: userAnswer })"
              >
                <VueIcon name="md:send" class="mr-3" size="20" />
                Valider ma réponse
              </Button>
            </div>
          </div>

          <!-- Question répondue -->
          <div v-else class="space-y-6">
            <div class="text-center py-8">
              <h3
                :class="[
                  'text-2xl font-bold mb-2',
                   'text-emerald-300'
                ]"
              >
               Reviens demain pour connaître la réponse !
              </h3>
            </div>

            <!-- Question et réponse -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                class="bg-surface-700/50 border border-foam-200/10 rounded-xl p-6"
              >
                <h4
                  class="text-foam-300 font-semibold mb-3 uppercase tracking-wider text-sm"
                >
                  Question
                </h4>
                <p class="text-white font-medium text-lg">
                  {{ gamesStore.dailyQuiz.todayQuestion?.question }}
                </p>
              </div>
              <div
                class="bg-surface-700/50 border border-foam-200/10 rounded-xl p-6"
              >
                <h4
                  class="text-foam-300 font-semibold mb-3 uppercase tracking-wider text-sm"
                >
                  Ta réponse
                </h4>
                <p class="text-white font-medium text-lg">
                  {{ gamesStore.dailyQuiz.todayAnswer?.userAnswer }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Onglet Résultat d'hier -->
      <Card
        v-if="activeTab === 'yesterday'"
        class="p-8 backdrop-blur-xl border border-foam-200/10 animate-in fade-in duration-300"
      >
        <div v-if="gamesStore.dailyQuiz.yesterdayQuestion" class="space-y-8">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-white mb-2">Résultat d'hier</h2>
            <p class="text-foam-300">Voici comment tu t'en es sorti !</p>
          </div>

          <!-- Résultat principal -->
          <div
            :class="[
              'rounded-2xl p-8 text-center',
              gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/30'
                : 'bg-gradient-to-br from-blush-500/20 to-blush-600/10 border border-blush-400/30',
            ]"
          >
            <div class="flex items-center justify-center mb-6">
              <div
                :class="[
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect
                    ? 'bg-emerald-500'
                    : 'bg-blush-500',
                ]"
              >
                <VueIcon v-if="gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect" name="md:sharp-check-circle" size="32" />
                <VueIcon v-else name="md:cancel" size="32" />
              </div>
            </div>
            <h3
              :class="[
                'text-xl font-bold mb-2',
                gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect
                  ? 'text-emerald-300'
                  : 'text-blush-300',
              ]"
            >
              {{
                gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect
                  ? "Excellente réponse ! 🎉"
                  : "Ce n'était pas la bonne réponse 😔"
              }}
            </h3>
            <p
              v-if="
                gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect
              "
              class="text-emerald-200"
            >
              Tu as gagné
              <span class="font-bold text-emerald-300"
                >+{{
                  gamesStore.dailyQuiz.yesterdayQuestion.userAnswer.points
                }}
                points</span
              >
            </p>
            <p v-else class="text-blush-200">
              Tu auras plus de chance aujourd'hui !
            </p>
          </div>

          <!-- Détails -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              class="bg-surface-700/50 border border-foam-200/10 rounded-xl p-6"
            >
              <h4
                class="text-foam-300 font-semibold mb-3 uppercase tracking-wider text-sm"
              >
                Question
              </h4>
              <p class="text-white">
                {{ gamesStore.dailyQuiz.yesterdayQuestion.question }}
              </p>
            </div>
            <div
              class="bg-surface-700/50 border border-foam-200/10 rounded-xl p-6"
            >
              <h4
                class="text-foam-300 font-semibold mb-3 uppercase tracking-wider text-sm"
              >
                Ta réponse
              </h4>
              <p class="text-white">
                {{
                  gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.userAnswer
                }}
              </p>
            </div>
            <div
              class="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-6"
            >
              <h4
                class="text-emerald-300 font-semibold mb-3 uppercase tracking-wider text-sm"
              >
                Bonne réponse
              </h4>
              <p class="text-emerald-200 font-medium">
                {{ gamesStore.dailyQuiz.yesterdayQuestion.correctAnswer }}
              </p>
            </div>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-else class="text-center py-16">
          <VueIcon
            name="md:schedule"
            class="text-foam-400 mx-auto mb-4"
            size="64"
          />
          <h3 class="text-xl font-bold text-white mb-2">
            Aucun résultat disponible
          </h3>
          <p class="text-foam-300">Reviens demain pour voir tes résultats !</p>
        </div>
      </Card>

      <!-- Onglet Classement -->
      <Card
        v-if="activeTab === 'leaderboard'"
        class="p-8 backdrop-blur-xl border border-foam-200/10 animate-in fade-in duration-300"
      >
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-white mb-2">
              Classement de la semaine
            </h2>
            <p class="text-foam-300">Découvre qui domine cette semaine !</p>
          </div>

          <div
            class="bg-gradient-to-r from-amber-500/10 to-amber-400/10 border border-amber-400/20 rounded-xl overflow-hidden"
          >
            <TableTanstack :table="table" />
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
