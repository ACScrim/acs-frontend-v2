import type { ApiResponse, LogEntry, Report, UserAdmin } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";
import { useToastStore } from "./toastStore";

const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as Array<UserAdmin>,
    logs: [] as Array<LogEntry>,
  }),
  actions: {
    async fetchUsers() {
      try {
        const response = await api.get<ApiResponse<UserAdmin[]>>("/admin/users");
        const usersArray = response.data.data;
        this.users = usersArray;
      } catch (error: any) {
        useToastStore().error("Error fetching all users:", error.message || error);
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