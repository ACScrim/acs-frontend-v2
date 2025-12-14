import { type ApiResponse, type ChallongeBracketResponse, type ChallongeBracketSettings } from "@/types/models";
import api from "@/utils/api";

const challongeService = {
  /**
   * Creates a Challonge bracket for a tournament
   * @param tournamentId - The ID of the tournament to create a bracket for
   * @param settings - Optional Challonge bracket settings
   * @returns Promise with the Challonge bracket response
   */
  createBracket: async (tournamentId: string, settings?: ChallongeBracketSettings): Promise<ChallongeBracketResponse> => {
    const response = await api.post<ApiResponse<ChallongeBracketResponse>>(
      `/admin/tournaments/${tournamentId}/challonge/create`,
      settings || {}
    );
    if (!response.data.success) {
      throw new Error('Failed to create Challonge bracket');
    }
    return response.data.data;
  }
};

export default challongeService;
