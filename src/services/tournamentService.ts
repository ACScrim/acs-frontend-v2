import { type ApiResponse, type Tournament } from "@/types/models";
import api from "@/utils/api";

const tournamentService = {
  getTournaments: async () => {
    const response = await api.get<ApiResponse<Tournament[]>>('/tournaments');
    if (!response.data.success) {
      throw new Error('Failed to fetch tournaments');
    }
    return response.data.data;
  },
  registerToTournament: async (tournamentId: string, registrationType: "caster" | "player") => {
    const response = await api.post<ApiResponse<Tournament>>(`/tournaments/${tournamentId}/register`, {
      registrationType
    });
    if (!response.data.success) {
      throw new Error('Failed to register for tournament');
    }
    return response.data.data;
  },
  unregisterFromTournament: async (tournamentId: string) => {
    const response = await api.post<ApiResponse<Tournament>>(`/tournaments/${tournamentId}/unregister`);
    if (!response.data.success) {
      throw new Error('Failed to unregister from tournament');
    }
    return response.data.data;
  },
  addClipToTournament: async (tournamentId: string, clipUrl: string) => {
    const response = await api.post<ApiResponse<Tournament>>(`/tournaments/${tournamentId}/clips`, {
      clipUrl
    });
    if (!response.data.success) {
      throw new Error('Failed to add clip to tournament');
    }
    return response.data.data;
  },
  voteMvpInTournament: async (tournamentId: string, playerId: string) => {
    const response = await api.post<ApiResponse<any>>(`/tournaments/${tournamentId}/mvps/vote`, {
      playerId
    });
    if (!response.data.success) {
      throw new Error('Failed to vote MVP in tournament');
    }
    return response.data.data;
  },
  closeMvpVoteInTournament: async (tournamentId: string) => {
    const response = await api.post<ApiResponse<Tournament>>(`/tournaments/${tournamentId}/mvps/close`);
    if (!response.data.success) {
      throw new Error('Failed to close MVP vote in tournament');
    }
    return response.data.data;
  }
};

export default tournamentService;