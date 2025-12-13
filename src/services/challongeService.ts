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
  },

  /**
   * Updates an existing Challonge bracket with current tournament data
   * @param tournamentId - The ID of the tournament
   * @returns Promise with the updated bracket response
   */
  updateBracket: async (tournamentId: string): Promise<ChallongeBracketResponse> => {
    const response = await api.post<ApiResponse<ChallongeBracketResponse>>(
      `/admin/tournaments/${tournamentId}/challonge/update`
    );
    if (!response.data.success) {
      throw new Error('Failed to update Challonge bracket');
    }
    return response.data.data;
  },

  /**
   * Starts the Challonge tournament
   * @param tournamentId - The ID of the tournament
   * @returns Promise with success status
   */
  startBracket: async (tournamentId: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(
      `/admin/tournaments/${tournamentId}/challonge/start`
    );
    if (!response.data.success) {
      throw new Error('Failed to start Challonge bracket');
    }
  },

  /**
   * Finalizes the Challonge tournament
   * @param tournamentId - The ID of the tournament
   * @returns Promise with success status
   */
  finalizeBracket: async (tournamentId: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(
      `/admin/tournaments/${tournamentId}/challonge/finalize`
    );
    if (!response.data.success) {
      throw new Error('Failed to finalize Challonge bracket');
    }
  },

  /**
   * Deletes the Challonge bracket
   * @param tournamentId - The ID of the tournament
   * @returns Promise with success status
   */
  deleteBracket: async (tournamentId: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(
      `/admin/tournaments/${tournamentId}/challonge`
    );
    if (!response.data.success) {
      throw new Error('Failed to delete Challonge bracket');
    }
  },

  /**
   * Synchronizes results from Challonge back to the tournament
   * @param tournamentId - The ID of the tournament
   * @returns Promise with success status
   */
  syncResults: async (tournamentId: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(
      `/admin/tournaments/${tournamentId}/challonge/sync`
    );
    if (!response.data.success) {
      throw new Error('Failed to sync Challonge results');
    }
  }
};

export default challongeService;
