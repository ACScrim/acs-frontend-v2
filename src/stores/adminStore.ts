import type {
  ApiResponse,
  CollectibleCard,
  Game,
  GameProposal,
  LogEntry,
  PlayerGameLevel,
  Report,
  ScrimiumAdmin,
  Season,
  Tournament,
  TournamentFormData,
  TournamentPhase,
  UserAdmin
} from "@/types/models";
import api from "@/utils/api";
import {defineStore} from "pinia";
import {useToastStore} from "./toastStore";

const updateOneElementInArray = <T extends { id: string }>(array: T[], element: T) => {
  const index = array.findIndex(t => t.id === element.id);
  if (index !== -1) {
    array[index] = element;
  } else {
    array.push(element);
  }
}

const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as Array<UserAdmin>,
    logs: [] as Array<LogEntry>,
    tournaments: [] as Array<Tournament>,
    playerLevels: [] as Array<PlayerGameLevel>,
    games: [] as Array<Game>,
    seasons: [] as Array<Season>,
    proposals: [] as Array<GameProposal>,
    cards: [] as Array<CollectibleCard>,
    scrimiums: [] as Array<ScrimiumAdmin>
  }),
  getters: {
    getTournaments: (state) => {
      return state.tournaments;
    },
    getTournamentById: (state) => {
      return (id: string) => state.tournaments.find(t => t.id === id);
    }
  },
  actions: {
    // FETCH ACTIONS
    async fetchUsers() {
      try {
        const response = await api.get<ApiResponse<UserAdmin[]>>("/admin/users");
        const usersArray = response.data.data;
        this.users = usersArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all users:", error.message || error);
      }
    },
    async fetchTournaments() {
      try {
        const response = await api.get<ApiResponse<Tournament[]>>("/admin/tournaments");
        const tournamentsArray = response.data.data;
        this.tournaments = tournamentsArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all tournaments:", error.message || error);
      }
    },
    async fetchTournamentDetails(tournamentId: string) {
      try {
        const response = await api.get<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}`);
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
      } catch (error: any) {
        useToastStore().error("Error fetching tournament details:", error.message || error);
      }
    },
    async fetchPlayerLevels() {
      try {
        const response = await api.get<ApiResponse<PlayerGameLevel[]>>("/admin/playergamelevels");
        const playerLevelsArray = response.data.data;
        this.playerLevels = playerLevelsArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all player levels:", error.message || error);
      }
    },
    async fetchGames() {
      try {
        const response = await api.get<ApiResponse<Game[]>>("/admin/games");
        const gamesArray = response.data.data;
        this.games = gamesArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all games:", error.message || error);
      }
    },
    async fetchSeasons() {
      try {
        const response = await api.get<ApiResponse<Season[]>>("/admin/seasons");
        const seasonsArray = response.data.data;
        this.seasons = seasonsArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all seasons:", error.message || error);
      }
    },
    async fetchProposals() {
      try {
        const response = await api.get<ApiResponse<GameProposal[]>>("/admin/proposals");
        const proposalsArray = response.data.data;
        this.proposals = proposalsArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all proposals:", error.message || error);
      }
    },
    async fetchCards() {
      try {
        const response = await api.get<ApiResponse<CollectibleCard[]>>("/admin/cards");
        const cardsArray = response.data.data;
        this.cards = cardsArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all collectible cards:", error.message || error);
      }
    },
    async fetchScrimiums() {
      try {
        const response = await api.get<ApiResponse<Array<ScrimiumAdmin>>>("/admin/scrimiums");
        const scrimiumsArray = response.data.data;
        this.scrimiums = scrimiumsArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all scrimiums:", error.message || error);
      }
    },
    // MODIFY ACTIONS
    async addReportToUser(userId: string, reason: string) {
      try {
        const response = await api.post<ApiResponse<Report>>(`/reports`, { userId, reason });
        const newReport = response.data.data;
        const user = this.users.find(user => user.id === userId);
        if (user) {
          user.reports.push(newReport);
        }
        this.users = this.users.map(u => u.id === userId ? user! : u);
      } catch (error: any) {
        useToastStore().error("Error adding report to user:", error.message || error);
      }
    },
    async removeReport(reportId: string, userId: string) {
      try {
        await api.delete(`/reports/${reportId}`);
        const user = this.users.find(user => user.id === userId);
        if (user) {
          user.reports = user.reports.filter(report => report.id !== reportId);
        }
        this.users = this.users.map(u => u.id === userId ? user! : u);
      } catch (error: any) {
        useToastStore().error("Error removing report from user:", error.message || error);
      }
    },
    async updateUserRole(userId: string, newRole: string) {
      try {
        await api.patch<ApiResponse<UserAdmin>>(`/admin/users/${userId}/role`, { role: newRole });
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          this.users.find(u => u.id === userId)!.role = newRole;
          this.users = [...this.users];
        }
      } catch (error: any) {
        useToastStore().error("Error updating user role:", error.message || error);
      }
    },
    async saveTournamentTeams(tournamentId: string, teamsData: Array<{ name: string; users: string[] }>) {
      try {
        const response = await api.post<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/teams`, { teams: teamsData });
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
      } catch (error: any) {
        useToastStore().error("Error saving tournament teams:", error.message || error);
      }
    },
    async updateTournamentPlayer(tournamentId: string, playerId: string, data: { tier?: string; description?: string, hasCheckin?: boolean }) {
      try {
        const response = await api.patch(`/admin/tournaments/${tournamentId}/players/${playerId}`, data);
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
      } catch (error: any) {
        useToastStore().error("Error updating tournament player:", error.message || error);
      }
    },
    async addTournamentPlayer(tournamentId: string, userId: string) {
      try {
        const response = await api.post(`/admin/tournaments/${tournamentId}/players`, { userId });
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
      } catch (error: any) {
        useToastStore().error("Error adding tournament player:", error.message || error);
      }
    },
    async removeTournamentPlayer(tournamentId: string, playerId: string) {
      try {
        const response = await api.delete(`/admin/tournaments/${tournamentId}/players/${playerId}`);
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
      } catch (error: any) {
        useToastStore().error("Error removing tournament player:", error.message || error);
      }
    },
    async publishTournamentTeams(tournamentId: string, teamsPublished: boolean) {
      try {
        const response = await api.post<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/publish-teams`, { teamsPublished });
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
      } catch (error: any) {
        useToastStore().error("Error publishing tournament teams:", error.message || error);
      }
    },
    async updateTeamDetails(tournamentId: string, teamId: string, data: { score?: number; ranking?: number, name?: string }) {
      const response = await api.patch<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/teams`, { oldName: teamId, ...data });
      const tournament = response.data.data;
      updateOneElementInArray(this.tournaments, tournament);
    },
    async updateTournament(tournamentId: string, data: TournamentFormData) {
      try {
        const response = await api.patch<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}`, data);
        const updatedTournament = response.data.data;
        updateOneElementInArray(this.tournaments, updatedTournament);
      } catch (error: any) {
        useToastStore().error("Error updating tournament:", error.message || error);
      }
    },
    async createTournament(data: TournamentFormData) {
      try {
        const response = await api.post<ApiResponse<Tournament>>(`/admin/tournaments`, data);
        const newTournament = response.data.data;
        updateOneElementInArray(this.tournaments, newTournament);
      } catch (error: any) {
        useToastStore().error("Error creating tournament:", error.message || error);
      }
    },
    async deleteTournament(tournamentId: string) {
      try {
        await api.delete(`/admin/tournaments/${tournamentId}`);
        this.tournaments = this.tournaments.filter(t => t.id !== tournamentId);
      } catch (error: any) {
        useToastStore().error("Error deleting tournament:", error.message || error);
      }
    },
    // GAME ACTIONS
    async createGame(data: { name: string; rawgId?: number; imageUrl: string; description?: string; roles?: Array<{ name: string; color: string }>; gameProfileLinkRegex?: string }) {
      try {
        const response = await api.post<ApiResponse<Game>>(`/admin/games`, data);
        const newGame = response.data.data;
        updateOneElementInArray(this.games, newGame);
      } catch (error: any) {
        useToastStore().error("Error creating game:", error.message || error);
        throw error;
      }
    },
    async updateGame(gameId: string, data: { roles?: Array<{ name: string; color: string }>; gameProfileLinkRegex?: string, gameUsernameRegex?: string; }) {
      try {
        const response = await api.patch<ApiResponse<Game>>(`/admin/games/${gameId}`, data);
        const updatedGame = response.data.data;
        updateOneElementInArray(this.games, updatedGame);
      } catch (error: any) {
        useToastStore().error("Error updating game:", error.message || error);
        throw error;
      }
    },
    async deleteGame(gameId: string) {
      try {
        await api.delete(`/admin/games/${gameId}`);
        this.games = this.games.filter(g => g.id !== gameId);
      } catch (error: any) {
        useToastStore().error("Error deleting game:", error.message || error);
        throw error;
      }
    },
    // SEASON ACTIONS
    async createSeason(data: { number: number; tournamentIds: string[] }) {
      try {
        const response = await api.post<ApiResponse<Season>>(`/admin/seasons`, data);
        const newSeason = response.data.data;
        updateOneElementInArray(this.seasons, newSeason);
      } catch (error: any) {
        useToastStore().error("Error creating season:", error.message || error);
        throw error;
      }
    },
    async updateSeason(seasonId: string, data: { number: number; tournamentIds: string[] }) {
      try {
        const response = await api.patch<ApiResponse<Season>>(`/admin/seasons/${seasonId}`, data);
        const updatedSeason = response.data.data;
        updateOneElementInArray(this.seasons, updatedSeason);
      } catch (error: any) {
        useToastStore().error("Error updating season:", error.message || error);
        throw error;
      }
    },
    async deleteSeason(seasonId: string) {
      try {
        await api.delete(`/admin/seasons/${seasonId}`);
        this.seasons = this.seasons.filter(s => s.id !== seasonId);
      } catch (error: any) {
        useToastStore().error("Error deleting season:", error.message || error);
        throw error;
      }
    },
    // Cards ACTIONS
    async approveCard(cardId: string) {
      try {
        const response = await api.post<ApiResponse<CollectibleCard>>(`/admin/cards/${cardId}/approve`, { });
        const updatedCard = response.data.data;
        updateOneElementInArray(this.cards, updatedCard);
        this.fetchCards().then(_ => {})
      } catch (error: any) {
        useToastStore().error("Error updating card status:", error.message || error);
        throw error;
      }
    },
    async rejectCard(cardId: string) {
      try {
        const response = await api.post<ApiResponse<CollectibleCard>>(`/admin/cards/${cardId}/reject`, { });
        const updatedCard = response.data.data;
        updateOneElementInArray(this.cards, updatedCard);
        this.fetchCards().then(_ => {})
      } catch (error: any) {
        useToastStore().error("Error updating card status:", error.message || error);
        throw error;
      }
    },
    // LOGS ACTIONS
    addLog(logLine: string) {
      const log = JSON.parse(logLine) as LogEntry;
      if (this.logs.length <= 50) {
        if (!this.logs.find(l => l.reqId === log.reqId && l.time === log.time))
          this.logs.push(log);
      } else {
        this.logs.shift();
        if (!this.logs.find(l => l.reqId === log.reqId && l.time === log.time))
          this.logs.push(log);
      }
    },
    // PROPOSAL ACTIONS
    async rejectProposal(proposalId: string) {
      try {
        await api.delete(`/admin/proposals/${proposalId}`);
        this.proposals = this.proposals.filter(p => p.id !== proposalId);
      } catch (error: any) {
        useToastStore().error("Error rejecting proposal:", error.message || error);
        throw error;
      }
    },
    async finalizeTournamentResults(tournamentId: string, data: { results: Array<{ teamId?: string; name?: string; score: number; ranking: number }>; openMvpVote?: boolean }) {
      try {
        const response = await api.post<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/results`, data);
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
        return tournament;
      } catch (error: any) {
        useToastStore().error("Error finalizing tournament results:", error.message || error);
        throw error;
      }
    },
    // SCRIMIUM ACTIONS
    async updateScrimiumBalance(userId: string, amount: number, action: 'add' | 'remove') {
      try {
        const response = await api.post<ApiResponse<ScrimiumAdmin>>(`/admin/scrimiums/${userId}`, { amount, action });
        const updatedScrimium = response.data.data;
        const index = this.scrimiums.findIndex(s => s.user.id === userId);
        if (index !== -1) {
          this.scrimiums[index] = { ...this.scrimiums[index], ...updatedScrimium };
        }
      } catch (error: any) {
        useToastStore().error("Error updating scrimium balance:", error.message || error);
        throw error;
      }
    },
    // TOURNAMENT PHASE ACTIONS
    async createTournamentPhase(tournamentId: string, phaseData: TournamentPhase) {
      try {
        const response = await api.post<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/phases`, phaseData);
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
        return tournament;
      } catch (error: any) {
        useToastStore().error(`Error creating tournament phase: ${error.message || error}`);
        throw error;
      }
    },
    async updateTournamentPhase(tournamentId: string, phaseId: string, phaseData: Partial<TournamentPhase>) {
      try {
        const response = await api.patch<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/phases/${phaseId}`, phaseData);
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
        return tournament;
      } catch (error: any) {
        useToastStore().error(`Error updating tournament phase: ${error.message || error}`);
        throw error;
      }
    },
    async deleteTournamentPhase(tournamentId: string, phaseId: string) {
      try {
        const response = await api.delete<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/phases/${phaseId}`);
        const tournament = response.data.data;
        updateOneElementInArray(this.tournaments, tournament);
        return tournament;
      } catch (error: any) {
        useToastStore().error(`Error deleting tournament phase: ${error.message || error}`);
        throw error;
      }
    }
  }
})

export default useAdminStore;

