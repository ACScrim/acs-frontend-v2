import type { ApiResponse, User } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    users: [] as User[]
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
    async logout() {
      try {
        await api.post("/auth/logout");
        this.user = null;
      } catch (error) {
        console.error("Error logging out:", error);
      }
    },
  },
});