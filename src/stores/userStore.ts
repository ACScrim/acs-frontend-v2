import type { ApiResponse, User, UserWithStats } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";
import { useToastStore } from "./toastStore";

export const useUserStore = defineStore('acs-user', {
  state: () => ({
    user: null as User | null,
    users: {} as Record<string, UserWithStats>
  }),
  getters: {
    isSuperAdmin: (state) => state.user?.role === "superadmin",
    isAdmin: (state) =>
      state.user?.role === "admin" || state.user?.role === "superadmin",
    isCardAdmin: (state) => state.user?.role.includes('card'),
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    async fetchUser() {
      try {
        const response = await api.get<ApiResponse<User>>("/users/me");
        this.user = response.data.data;
      } catch (error) {
        this.user = null; // Assurez-vous de réinitialiser l'utilisateur en cas d'erreur
      }
    },
    async fetchUserById(id: string) {
      try {
        const response = await api.get<ApiResponse<UserWithStats>>(`/users/profile/${id}`);
        this.users[id] = response.data.data;
      } catch (error: any) {
        useToastStore().error(`Error fetching user with id ${id}:`, error.message || error);
      }
    },
    async updateTwitchUsername(username: string) {
      try {
        const response = await api.patch<ApiResponse<User>>("/users/me/twitch", { twitchUsername: username });
        this.user = response.data.data;

        // Mettre à jour également le cache des utilisateurs pour éviter l'affichage d'anciennes données
        if (this.user?.id) {
          const cachedUser = this.users[this.user.id];
          if (cachedUser) {
            cachedUser.twitchUsername = response.data.data.twitchUsername;
          }
        }
      } catch (error: any) {
        useToastStore().error("Error updating Twitch username:", error.message || error);
        throw error; // Propager l'erreur pour que le composant puisse la gérer
      }
    },
    async logout() {
      try {
        await api.post("/auth/logout").catch(() => {});
        this.user = null;
      } catch (error: any) {
        useToastStore().error("Error logging out:", error.message || error);
      }
    },
  }
});