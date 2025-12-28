import tournamentService from "@/services/tournamentService";
import {type ApiResponse, type ChallongeMatch, type Game, type Tournament} from "@/types/models";
import { defineStore } from "pinia";
import api from "@/utils/api.ts";
import {useToastStore} from "@/stores/toastStore.ts";
import {useUserStore} from "@/stores/userStore.ts";

const useTournamentStore = defineStore('tournament', {
  state: () => ({
    tournaments: [] as Tournament[],
    isLoading: false,
  }),
  getters: {
    nextTournaments: (state) => {
      return state.tournaments.filter(t => !t.finished).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
    },
    finishedTournaments: (state) => {
      return state.tournaments.filter(t => t.finished).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
    },
    upcomingTournaments: (state) => {
      return state.tournaments.filter(t => !t.finished).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
    },
    gamesPlayed: (state) => {
      return state.tournaments.reduce((acc: Game[], tournament: Tournament) => {
        if (acc.includes(tournament.game)) {
          return acc;
        }
        return [...acc, tournament.game];
      }, []);
    },
    getById: (state) => {
      return (id: string) => state.tournaments.find(t => t.id === id);
    }
  },
  actions: {
    async fetchTournaments() {
      this.isLoading = true;
      this.tournaments = await tournamentService.getTournaments();
      this.isLoading = false;
    },
    async fetchTournament(tournamentId: string) {
      this.isLoading = true;
      const response = await api.get<ApiResponse<Tournament>>(`tournaments/${tournamentId}`);
      const tournament = response.data.data as Tournament;
      const index = this.tournaments.findIndex(t => t.id === tournamentId);
      if (index !== -1) {
        this.tournaments[index] = tournament;
      }
      this.isLoading = false;
    },
    async registerToTournament(tournamentId: string, registrationType: "caster" | "player" = "player") {
      this.isLoading = true;
      const updatedTournament = await tournamentService.registerToTournament(tournamentId, registrationType);
      const index = this.tournaments.findIndex(t => t.id === tournamentId);
      if (index !== -1) {
        this.tournaments[index] = updatedTournament;
      }
      this.isLoading = false;
    },
    async unregisterFromTournament(tournamentId: string) {
      this.isLoading = true;
      const updatedTournament = await tournamentService.unregisterFromTournament(tournamentId);
      const index = this.tournaments.findIndex(t => t.id === tournamentId);
      if (index !== -1) {
        this.tournaments[index] = updatedTournament;
      }
      this.isLoading = false;
    },
    async addClipToTournament(tournamentId: string, clipUrl: string) {
      this.isLoading = true;
      const updatedTournament = await tournamentService.addClipToTournament(tournamentId, clipUrl);
      const index = this.tournaments.findIndex(t => t.id === tournamentId);
      if (index !== -1) {
        this.tournaments[index] = updatedTournament;
      }
      this.isLoading = false;
    },
    async voteMvpInTournament(tournamentId: string, playerId: string) {
      this.isLoading = true;
      const updatedTournament = await tournamentService.voteMvpInTournament(tournamentId, playerId);
      const index = this.tournaments.findIndex(t => t.id === tournamentId);
      if (index !== -1) {
        this.tournaments[index] = updatedTournament;
      }
      this.isLoading = false;
    },
    async checkinToTournament(tournamentId: string) {
      this.isLoading = true;
      const response = await api.post<ApiResponse<Tournament>>(`tournaments/${tournamentId}/checkin`);
      const updatedTournament = response.data.data as Tournament;
      const index = this.tournaments.findIndex(t => t.id === tournamentId);
      if (index !== -1) {
        this.tournaments[index] = updatedTournament;
      }
      this.isLoading = false;
    },
    async checkoutFromTournament(tournamentId: string) {
      this.isLoading = true;
      const response = await api.post<ApiResponse<Tournament>>(`tournaments/${tournamentId}/checkout`);
      const updatedTournament = response.data.data as Tournament;
      const index = this.tournaments.findIndex(t => t.id === tournamentId);
      if (index !== -1) {
        this.tournaments[index] = updatedTournament;
      }
      this.isLoading = false;
    },
    async fetchBracketMatches(tournamentId: string): Promise<ChallongeMatch[]> {
      try {
        return (await api.get<ApiResponse<ChallongeMatch[]>>(`tournaments/${tournamentId}/challonge-matches`))?.data?.data ?? [];
      } catch (e) {
        useToastStore().error("Erreur lors de la récupération des matchs du bracket.");
        return [];
      }
    },
    async placeBet(tournamentId: string, matchId: string, predictedWinner: string, amount: number) {
      try {
        await api.post<ApiResponse<null>>(`tournaments/${tournamentId}/bets`, {
          challongeMatchId: matchId,
          predictedWinner,
          amount,
        });
        useUserStore().fetchUser().then();
      } catch (e) {
        throw e;
      }
    },
    async cancelBet(tournamentId: string, matchId: string) {
      try {
        await api.delete<ApiResponse<null>>(`tournaments/${tournamentId}/bets/${matchId}`);
        useUserStore().fetchUser().then();
      } catch (e) {
        throw e;
      }
    },
    async validateBets(tournamentId: string) {
      try {
        await api.post<ApiResponse<null>>(`tournaments/${tournamentId}/bets/validate`);
        useUserStore().fetchUser().then();
      } catch (e) {
        throw e;
      }
    }
  },
});

export default useTournamentStore;