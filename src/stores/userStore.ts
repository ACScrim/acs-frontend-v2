import type { ApiResponse, User, UserWithStats } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

export const useUserStore = defineStore('acs-user', {
  state: () => ({
    user: null as User | null,
    users: {} as Record<string, UserWithStats>
  }),
  getters: {
    isSuperAdmin: (state) => state.user?.role === "superadmin",
    isAdmin: (state) =>
      state.user?.role === "admin" || state.user?.role === "superadmin",
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
      } catch (error) {
        console.error(`Error fetching user with id ${id}:`, error);
      }
    },
    async logout() {
      try {
        await api.post("/auth/logout");
        this.user = null;
      } catch (error) {
        console.error("Error logging out:", error);
      }
    },
  }
});