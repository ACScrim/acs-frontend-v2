<script setup lang="ts">
import useGamesStore from "@/stores/gamesStore.ts";
import { computed, h, onMounted, onUnmounted, ref } from "vue";
import { Avatar, Button, Card } from "@/components/ui";
import { useToastStore } from "@/stores/toastStore.ts";
import { getCoreRowModel, useVueTable } from "@tanstack/vue-table";
import type { WeeklyLeaderboardEntry } from "@/types/models";
import TableTanstack from "@/components/global/TableTanstack.vue";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import { shuffleArray } from "@/utils";
import { useUserStore } from "@/stores/userStore.ts";

const activeTab = ref<
  "today" | "yesterday" | "leaderboard" | "lastWeekLeaderboard"
>("today");

const gamesStore = useGamesStore();

const userAnswer = ref<string>("");
const answerTimeInterval = ref<number | null>(null);
const isAnswerCorrect = ref<boolean | null>(null);

onMounted(async () => {
  await gamesStore.fetchDailyQuestion();
  await gamesStore.fetchYesterdayDailyQuestion();
  await gamesStore.fetchTodayDailyAnswer();
  await gamesStore.fetchWeeklyLeaderboard();
  await gamesStore.fetchLastWeeklyLeaderboard();

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
  useUserStore().fetchUser().then();
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

const lastWeekTable = useVueTable<WeeklyLeaderboardEntry>({
  get data() {
    return gamesStore.dailyQuiz.leaderboards
      .lastWeekly as WeeklyLeaderboardEntry[];
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
  <div
    class="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6"
  >
    <!-- Header avec titre principal -->
    <div class="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
      <h1
        class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-azure-400 to-accent-400 bg-clip-text text-transparent"
      >
        Quiz Quotidien
      </h1>
      <p class="text-sm sm:text-base lg:text-lg text-foam-300 px-2">
        Teste tes connaissances chaque jour !
      </p>
    </div>

    <!-- Système d'onglets -->
    <div class="flex justify-center mb-6 sm:mb-8">
      <div
        class="bg-surface-800/50 rounded-xl p-1 border border-foam-200/10 flex w-full max-w-4xl gap-1 flex-col sm:flex-row"
      >
        <Button
          @click="activeTab = 'today'"
          :variant="activeTab === 'today' ? 'primary' : 'ghost'"
          class="flex-1 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
        >
          <VueIcon name="md:today" size="18" />
          <span class="hidden xs:inline">Aujourd'hui</span>
          <span class="xs:hidden">Auj.</span>
        </Button>

        <Button
          @click="activeTab = 'yesterday'"
          :variant="activeTab === 'yesterday' ? 'secondary' : 'ghost'"
          class="flex-1 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
        >
          <VueIcon name="md:calendar-today" size="18" />
          <span>Hier</span>
        </Button>

        <Button
          @click="activeTab = 'leaderboard'"
          :variant="activeTab === 'leaderboard' ? 'outline' : 'ghost'"
          class="flex-1 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
        >
          <VueIcon name="md:leaderboard" size="18" />
          <span class="hidden sm:inline">Cette semaine</span>
          <span class="sm:hidden">Semaine</span>
        </Button>

        <Button
          @click="activeTab = 'lastWeekLeaderboard'"
          :variant="activeTab === 'lastWeekLeaderboard' ? 'outline' : 'ghost'"
          class="flex-1 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
        >
          <VueIcon name="md:history" size="18" />
          <span class="hidden sm:inline">Semaine dernière</span>
          <span class="sm:hidden">Précédente</span>
        </Button>
      </div>
    </div>

    <!-- Contenu des onglets -->
    <div class="min-h-[400px] sm:min-h-[500px]">
      <!-- Onglet Question d'aujourd'hui -->
      <Card
        v-if="activeTab === 'today'"
        class="p-4 sm:p-6 lg:p-8 backdrop-blur-xl border border-foam-200/10 animate-in fade-in duration-300"
      >
        <div class="space-y-6 sm:space-y-8">
          <!-- Status et timer -->
          <div
            class="bg-gradient-to-r from-emerald-500/10 to-azure-500/10 border border-emerald-200/20 rounded-xl p-4 sm:p-6"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
            >
              <div class="space-y-1">
                <h2 class="text-lg sm:text-xl font-bold text-white">
                  Question du jour
                </h2>
                <p
                  v-if="dailyQuestionDiscovered && !dailyQuestionAnswered"
                  class="text-emerald-300 font-medium flex items-center gap-2 text-sm sm:text-base"
                >
                  <VueIcon
                    name="md:sharp-access-time-filled"
                    class="text-emerald-400"
                    size="18"
                  />
                  <span class="hidden sm:inline">Temps écoulé :</span>
                  <span class="sm:hidden">Temps :</span>
                  <span id="answer-time" class="text-emerald-400 font-bold"
                    >00:00:00</span
                  >
                </p>
                <p
                  v-else-if="dailyQuestionAnswered"
                  class="text-emerald-300 font-medium flex items-center gap-2 text-sm sm:text-base"
                >
                  <VueIcon
                    name="md:sharp-check-circle"
                    class="text-emerald-400"
                    size="18"
                  />
                  <span class="hidden sm:inline">Répondu en :</span>
                  <span class="sm:hidden">Temps :</span>
                  <span class="text-emerald-400 font-bold">{{
                    timeTaken
                  }}</span>
                </p>
                <p v-else class="text-foam-300 text-sm sm:text-base">
                  ✨ Prêt pour le défi du jour ?
                </p>
              </div>

              <VueIcon
                v-if="dailyQuestionAnswered"
                name="md:sharp-check-circle"
                class="text-emerald-400 flex-shrink-0"
                size="32"
              />
              <VueIcon
                v-else-if="dailyQuestionDiscovered"
                name="md:sharp-access-time-filled"
                class="text-amber-400 flex-shrink-0"
                size="32"
              />
              <VueIcon
                v-else
                name="md:visibility"
                class="text-azure-400 flex-shrink-0"
                size="32"
              />
            </div>
          </div>

          <!-- État initial -->
          <div
            v-if="!dailyQuestionDiscovered"
            class="text-center py-12 sm:py-16"
          >
            <div class="space-y-4 sm:space-y-6">
              <div
                class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-azure-400 rounded-full flex items-center justify-center mx-auto"
              >
                <VueIcon
                  name="md:quiz"
                  class="text-white text-[40px] sm:text-[48px]"
                />
              </div>
              <div class="space-y-2 sm:space-y-3 px-4">
                <h3 class="text-xl sm:text-2xl font-bold text-white">
                  Découvre la question du jour
                </h3>
                <p class="text-sm sm:text-base text-foam-300 max-w-md mx-auto">
                  Une nouvelle question t'attend ! Ton chrono commencera dès que
                  tu la dévoileras.
                </p>
              </div>
              <Button
                class="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl shadow-emerald-500/25"
                @click="
                  updateAnswer({ discoveredAt: new Date().toISOString() })
                "
              >
                <VueIcon name="md:visibility" class="mr-2 sm:mr-3" size="20" />
                Dévoiler la question
              </Button>
            </div>
          </div>

          <!-- Question en cours -->
          <div
            v-else-if="!dailyQuestionAnswered"
            class="space-y-6 sm:space-y-8"
          >
            <!-- Question -->
            <div
              class="bg-gradient-to-br from-surface-700/60 to-surface-800/40 border border-foam-200/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
            >
              <div class="flex items-center gap-3 mb-3 sm:mb-4">
                <div
                  class="w-2 h-6 sm:h-8 bg-gradient-to-b from-azure-400 to-azure-500 rounded-full"
                ></div>
                <span
                  class="text-azure-300 font-semibold text-base sm:text-lg"
                  >{{ gamesStore.dailyQuiz.todayQuestion?.category }}</span
                >
              </div>
              <h3
                class="text-white text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed mb-4 sm:mb-6"
              >
                {{ gamesStore.dailyQuiz.todayQuestion?.question }}
              </h3>
              <img
                v-if="gamesStore.dailyQuiz.todayQuestion?.image"
                :src="gamesStore.dailyQuiz.todayQuestion?.image"
                :alt="`Image pour la question du jour : ${gamesStore.dailyQuiz.todayQuestion?.question}`"
                class="w-full object-contain rounded-lg sm:rounded-xl shadow-lg"
                :class="{
                  'max-h-48 sm:max-h-72':
                    gamesStore.dailyQuiz.todayQuestion?.category === 'Pokémon',
                }"
              />
            </div>

            <!-- Options -->
            <div class="space-y-3 sm:space-y-4">
              <h4 class="text-white font-semibold text-base sm:text-lg">
                Choisir une réponse :
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    class="w-full bg-surface-700/50 hover:bg-surface-600/70 border-2 border-foam-200/10 hover:border-emerald-400/40 rounded-lg sm:rounded-xl p-4 sm:p-6 transition-all duration-200 text-white cursor-pointer flex items-center gap-3 sm:gap-4 peer-checked:bg-gradient-to-r peer-checked:from-emerald-600/30 peer-checked:to-emerald-500/20 peer-checked:border-emerald-400/60 peer-checked:shadow-lg peer-checked:shadow-emerald-500/20 hover:scale-[1.02]"
                  >
                    <div
                      :class="[
                        'w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-200 flex-shrink-0',
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
                    <span
                      class="font-medium text-sm sm:text-base lg:text-lg break-words"
                      >{{ option }}</span
                    >
                  </label>
                </div>
              </div>
            </div>

            <!-- Bouton validation -->
            <div class="flex justify-center pt-2 sm:pt-4">
              <Button
                :disabled="!userAnswer"
                class="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-surface-600 disabled:to-surface-600 text-white font-bold px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                @click="updateAnswer({ userAnswer: userAnswer })"
              >
                <VueIcon name="md:send" class="mr-2 sm:mr-3" size="20" />
                Valider ma réponse
              </Button>
            </div>
          </div>

          <!-- Question répondue -->
          <div v-else class="space-y-4 sm:space-y-6">
            <div class="text-center py-6 sm:py-8">
              <h3
                :class="[
                  'text-xl sm:text-2xl font-bold mb-2',
                  'text-emerald-300',
                ]"
              >
                Reviens demain pour connaître la réponse !
              </h3>
            </div>

            <!-- Question et réponse -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div
                class="bg-surface-700/50 border border-foam-200/10 rounded-xl p-4 sm:p-6"
              >
                <h4
                  class="text-foam-300 font-semibold mb-2 sm:mb-3 uppercase tracking-wider text-xs sm:text-sm"
                >
                  Question
                </h4>
                <p class="text-white font-medium text-base sm:text-lg">
                  {{ gamesStore.dailyQuiz.todayQuestion?.question }}
                </p>
              </div>
              <div
                class="bg-surface-700/50 border border-foam-200/10 rounded-xl p-4 sm:p-6"
              >
                <h4
                  class="text-foam-300 font-semibold mb-2 sm:mb-3 uppercase tracking-wider text-xs sm:text-sm"
                >
                  Ta réponse
                </h4>
                <p
                  class="text-white font-medium text-base sm:text-lg break-words"
                >
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
        class="p-4 sm:p-6 lg:p-8 backdrop-blur-xl border border-foam-200/10 animate-in fade-in duration-300"
      >
        <div
          v-if="gamesStore.dailyQuiz.yesterdayQuestion"
          class="space-y-6 sm:space-y-8"
        >
          <div class="text-center">
            <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">
              Résultat d'hier
            </h2>
            <p class="text-sm sm:text-base text-foam-300">
              Voici comment tu t'en es sorti !
            </p>
          </div>

          <!-- Résultat principal -->
          <div
            :class="[
              'rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center',
              gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/30'
                : 'bg-gradient-to-br from-blush-500/20 to-blush-600/10 border border-blush-400/30',
            ]"
          >
            <div class="flex items-center justify-center mb-4 sm:mb-6">
              <div
                :class="[
                  'w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center',
                  gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect
                    ? 'bg-emerald-500'
                    : 'bg-blush-500',
                ]"
              >
                <VueIcon
                  v-if="
                    gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.isCorrect
                  "
                  name="md:sharp-check-circle"
                  class="text-white text-[24px] sm:text-[32px]"
                />
                <VueIcon
                  v-else
                  name="md:cancel"
                  class="text-white text-[24px] sm:text-[32px]"
                />
              </div>
            </div>
            <h3
              :class="[
                'text-lg sm:text-xl font-bold mb-2',
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
              class="text-emerald-200 text-sm sm:text-base"
            >
              Tu as gagné
              <span class="font-bold text-emerald-300"
                >+{{
                  gamesStore.dailyQuiz.yesterdayQuestion.userAnswer.points
                }}
                points</span
              >
            </p>
            <p v-else class="text-blush-200 text-sm sm:text-base">
              Tu auras plus de chance aujourd'hui !
            </p>
          </div>

          <!-- Détails -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div
              class="bg-surface-700/50 border border-foam-200/10 rounded-xl p-4 sm:p-6"
            >
              <h4
                class="text-foam-300 font-semibold mb-2 sm:mb-3 uppercase tracking-wider text-xs sm:text-sm"
              >
                Question
              </h4>
              <p class="text-white text-sm sm:text-base">
                {{ gamesStore.dailyQuiz.yesterdayQuestion.question }}
              </p>
            </div>
            <div
              class="bg-surface-700/50 border border-foam-200/10 rounded-xl p-4 sm:p-6"
            >
              <h4
                class="text-foam-300 font-semibold mb-2 sm:mb-3 uppercase tracking-wider text-xs sm:text-sm"
              >
                Ta réponse
              </h4>
              <p class="text-white text-sm sm:text-base break-words">
                {{
                  gamesStore.dailyQuiz.yesterdayQuestion.userAnswer?.userAnswer
                }}
              </p>
            </div>
            <div
              class="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 sm:p-6"
            >
              <h4
                class="text-emerald-300 font-semibold mb-2 sm:mb-3 uppercase tracking-wider text-xs sm:text-sm"
              >
                Bonne réponse
              </h4>
              <p
                class="text-emerald-200 font-medium text-sm sm:text-base break-words"
              >
                {{ gamesStore.dailyQuiz.yesterdayQuestion.correctAnswer }}
              </p>
            </div>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-else class="text-center py-12 sm:py-16">
          <VueIcon
            name="md:schedule"
            class="text-foam-400 mx-auto mb-4 text-[48px] sm:text-[64px]"
          />
          <h3 class="text-lg sm:text-xl font-bold text-white mb-2">
            Aucun résultat disponible
          </h3>
          <p class="text-sm sm:text-base text-foam-300">
            Reviens demain pour voir tes résultats !
          </p>
        </div>
      </Card>

      <!-- Onglet Classement -->
      <Card
        v-if="activeTab === 'leaderboard'"
        class="p-4 sm:p-6 lg:p-8 backdrop-blur-xl border border-foam-200/10 animate-in fade-in duration-300"
      >
        <div class="space-y-4 sm:space-y-6">
          <div class="text-center">
            <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">
              Classement de la semaine
            </h2>
            <p class="text-sm sm:text-base text-foam-300">
              Découvre qui domine cette semaine !
            </p>
          </div>

          <div
            class="bg-gradient-to-r from-amber-500/10 to-amber-400/10 border border-amber-400/20 rounded-xl overflow-hidden"
          >
            <div class="overflow-x-auto">
              <TableTanstack :table="table" />
            </div>
          </div>
        </div>
      </Card>

      <!-- Onglet Classement Semaine Dernière -->
      <Card
        v-if="activeTab === 'lastWeekLeaderboard'"
        class="p-4 sm:p-6 lg:p-8 backdrop-blur-xl border border-foam-200/10 animate-in fade-in duration-300"
      >
        <div class="space-y-4 sm:space-y-6">
          <div class="text-center">
            <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">
              Classement de la semaine dernière
            </h2>
            <p class="text-sm sm:text-base text-foam-300">
              Les champions de la semaine passée !
            </p>
          </div>

          <div
            class="bg-gradient-to-r from-purple-500/10 to-purple-400/10 border border-purple-400/20 rounded-xl overflow-hidden"
          >
            <div class="overflow-x-auto">
              <TableTanstack :table="lastWeekTable" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
