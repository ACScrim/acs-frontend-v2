import type { ApiResponse, User } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as Array<any>,
  }),
  actions: {
    async fetchUsers() {
      try {
        const response = await api.get<ApiResponse<User[]>>("/admin/users");
        const usersArray = response.data.data;
        this.users = usersArray;
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    }
  }
})

export default useAdminStore;