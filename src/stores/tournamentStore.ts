import tournamentService from "@/services/tournamentService";
import { type Game, type Tournament } from "@/types/models";
import { defineStore } from "pinia";

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
    async setGameLevel(tournament: Tournament, data: { level: string, selectedRoles: string[], gameUsername: string, isRanked: boolean, rank?: string, comment?: string }) {
      this.isLoading = true;
      await tournamentService.setGameLevel(tournament, data);
      await this.fetchTournaments();
      this.isLoading = false;
    }
  },
});

export default useTournamentStore;