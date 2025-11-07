import type { ApiResponse, Game, LogEntry, PlayerGameLevel, Report, Tournament, TournamentFormData, UserAdmin } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";
import { useToastStore } from "./toastStore";

const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as Array<UserAdmin>,
    logs: [] as Array<LogEntry>,
    tournaments: [] as Array<Tournament>,
    playerLevels: [] as Array<PlayerGameLevel>,
    games: [] as Array<Game>
  }),
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
        const index = this.tournaments.findIndex(t => t.id === tournamentId);
        if (index !== -1) {
          this.tournaments[index] = tournament;
        } else {
          this.tournaments.push(tournament);
        }
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
        useToastStore().success(`Rôle mis à jour avec succès`);
      } catch (error: any) {
        useToastStore().error("Error updating user role:", error.message || error);
      }
    },
    async saveTournamentTeams(tournamentId: string, teamsData: Array<{ name: string; users: string[] }>) {
      try {
        const response = await api.post<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/teams`, { teams: teamsData });
        const tournament = response.data.data;
        const index = this.tournaments.findIndex(t => t.id === tournamentId);
        if (index !== -1) {
          this.tournaments[index] = tournament;
        } else {
          this.tournaments.push(tournament);
        }
        useToastStore().success("Équipes sauvegardées avec succès");
      } catch (error: any) {
        useToastStore().error("Error saving tournament teams:", error.message || error);
      }
    },
    async updateTournamentPlayer(tournamentId: string, playerId: string, data: { tier?: string; description?: string }) {
      try {
        await api.patch(`/admin/tournaments/${tournamentId}/players/${playerId}`, data);
        useToastStore().success("Informations du joueur mises à jour avec succès");
      } catch (error: any) {
        useToastStore().error("Error updating tournament player:", error.message || error);
      }
    },
    async publishTournamentTeams(tournamentId: string, teamsPublished: boolean) {
      try {
        const response = await api.post<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/publish-teams`, { teamsPublished });
        const tournament = response.data.data;
        const index = this.tournaments.findIndex(t => t.id === tournamentId);
        if (index !== -1) {
          this.tournaments[index] = tournament;
        } else {
          this.tournaments.push(tournament);
        }
      } catch (error: any) {
        useToastStore().error("Error publishing tournament teams:", error.message || error);
      }
    },
    async updateTeamDetails(tournamentId: string, teamId: string, data: { score?: number; ranking?: number, name?: string }) {
      const response = await api.patch<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}/teams`, { oldName: teamId, ...data });
      const tournament = response.data.data;
      const index = this.tournaments.findIndex(t => t.id === tournamentId);
      if (index !== -1) {
        this.tournaments[index] = tournament;
      } else {
        this.tournaments.push(tournament);
      }
    },
    async updateTournament(tournamentId: string, data: TournamentFormData) {
      try {
        const response = await api.patch<ApiResponse<Tournament>>(`/admin/tournaments/${tournamentId}`, data);
        const updatedTournament = response.data.data;
        const index = this.tournaments.findIndex(t => t.id === tournamentId);
        if (index !== -1) {
          this.tournaments[index] = updatedTournament;
        } else {
          this.tournaments.push(updatedTournament);
        }
      } catch (error: any) {
        useToastStore().error("Error updating tournament:", error.message || error);
      }
    },
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
    }
  }
})

export default useAdminStore;