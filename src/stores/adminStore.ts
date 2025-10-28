import type { ApiResponse, Report, UserAdmin } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as Array<UserAdmin>,
  }),
  actions: {
    async fetchUsers() {
      try {
        const response = await api.get<ApiResponse<UserAdmin[]>>("/admin/users");
        const usersArray = response.data.data;
        this.users = usersArray;
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    },
    async addReportToUser(userId: string, reason: string) {
      try {
        const response = await api.post<ApiResponse<Report>>(`/reports`, { userId, reason });
        const newReport = response.data.data;
        const user = this.users.find(user => user.id === userId);
        if (user) {
          user.reports.push(newReport);
        }
      } catch (error) {
        console.error("Error adding report to user:", error);
      }
    },
    async removeReport(reportId: string, userId: string) {
      try {
        await api.delete(`/reports/${reportId}`);
        const user = this.users.find(user => user.id === userId);
        if (user) {
          user.reports = user.reports.filter(report => report.id !== reportId);
        }
      } catch (error) {
        console.error("Error removing report from user:", error);
      }
    }
  }
})

export default useAdminStore;