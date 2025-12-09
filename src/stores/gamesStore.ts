import {defineStore} from "pinia";
import type {
  AcsdleUser,
  ApiResponse,
  DailyAnswer,
  DailyQuestion,
  WeeklyLeaderboardEntry,
  YesterdayDailyQuestion
} from "@/types/models";
import {useToastStore} from "@/stores/toastStore.ts";
import api from "@/utils/api.ts";

const useGamesStore = defineStore('games', {
  state: () => ({
    dailyQuiz: {
      todayQuestion: null as DailyQuestion | null,
      yesterdayQuestion: null as YesterdayDailyQuestion | null,
      todayAnswer: null as DailyAnswer | null,
      leaderboards: {
        weekly: [] as WeeklyLeaderboardEntry[],
      }
    },
    acsdle: {
      users: [] as AcsdleUser[],
      dailyCryptedUser: null as { payload: string, iv: string, tag: string } | null,
      todayGuesses: [] as AcsdleUser[]
    }
  }),
  actions: {
    async fetchDailyQuestion() {
      try {
        const { data: { data: question }} = await api.get<ApiResponse<DailyQuestion>>("/games/dailyquiz/today");
        this.dailyQuiz.todayQuestion = question;
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de la récupération de la question du quiz quotidien.", e);
      }
    },
    async fetchYesterdayDailyQuestion() {
      try {
        const { data: { data: question }} = await api.get<ApiResponse<YesterdayDailyQuestion>>("/games/dailyquiz/yesterday");
        this.dailyQuiz.yesterdayQuestion = question;
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de la récupération de la question du quiz quotidien d'hier.", e);
      }
    },
    async fetchTodayDailyAnswer() {
      try {
        const { data: { data: answer }} = await api.get<ApiResponse<DailyAnswer>>("/games/dailyquiz/today-answer");
        this.dailyQuiz.todayAnswer = answer;
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de la récupération de la réponse du quiz quotidien.", e);
      }
    },
    async fetchWeeklyLeaderboard() {
      try {
        const { data: { data: leaderboard }} = await api.get<ApiResponse<WeeklyLeaderboardEntry[]>>("/games/dailyquiz/weekly-leaderboard");
        this.dailyQuiz.leaderboards.weekly = leaderboard;
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de la récupération du classement hebdomadaire du quiz quotidien.", e);
      }
    },
    async updateDailyAnswer(questionId: string, answerData: { cheated?: boolean, userAnswer?: string, discoveredAt?: string }) {
      try {
        const bodyWithoutUndefined: { [key: string]: any } = {};
        for (const key in answerData) {
          if (answerData[key as keyof typeof answerData] !== undefined) {
            bodyWithoutUndefined[key] = answerData[key as keyof typeof answerData];
          }
        }
        const { data: { data: answer }} = await api.patch<ApiResponse<DailyAnswer>>(`/games/dailyquiz/answer/${questionId}`, bodyWithoutUndefined);
        this.dailyQuiz.todayAnswer = answer;
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de la soumission de la réponse du quiz quotidien.", e);
      }
    },
    // Acsdle
    async fetchAcsdleUsers() {
      try {
        const { data: { data: users }} = await api.get<ApiResponse<AcsdleUser[]>>("/games/acsdle/users");
        this.acsdle.users = users;
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de la récupération des utilisateurs Acsdle.", e);
      }
    },
    async fetchAcsdleDailyCryptedUser() {
      try {
        const { data: { data } } = await api.get<ApiResponse<{ payload: string, iv: string, tag: string }>>("/games/acsdle/daily");
        this.acsdle.dailyCryptedUser = data;
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de la récupération de l'utilisateur Acsdle du jour.", e);
      }
    },
    async fetchAcsdleTodayHistory() {
      try {
        const { data: { data: guesses }} = await api.get<ApiResponse<(AcsdleUser)[]>>("/games/acsdle/today-history");
        this.acsdle.todayGuesses = guesses;
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de la récupération de l'historique Acsdle d'aujourd'hui.", e);
      }
    },
    async addAcsdleTodayGuess(user: AcsdleUser) {
      try {
        await api.post<ApiResponse<(AcsdleUser)[]>>("/games/acsdle/today-history", {
          user
        });
        this.acsdle.todayGuesses.push(user);
      } catch (e: any) {
        useToastStore().error("Il y a une erreur lors de l'ajout de votre tentative Acsdle pour aujourd'hui.", e);
      }
    }
  }
});

export default useGamesStore;