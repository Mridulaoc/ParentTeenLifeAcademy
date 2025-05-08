import { adminApi } from "../Utils/api";

export const dashboardService = {
  fetchDashboardStats: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await adminApi.get("/dashboard/stats");
      return response;
    } catch (error) {
      throw error;
    }
  },
};
