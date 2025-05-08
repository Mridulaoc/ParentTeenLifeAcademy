import { IDashboardStats } from "../entities/dashboard";
import { DashboardRepository } from "../repositories/dashboardRepository";

export class GetDashboardUseCase {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute(): Promise<IDashboardStats> {
    try {
      const stats = await this.dashboardRepository.getDashboardStats();

      if (!stats) {
        throw new Error("Could not get stats");
      }

      return stats;
    } catch (error) {
      throw error;
    }
  }
}
