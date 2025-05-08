import { Request, Response } from "express";

import { DashboardRepository } from "../../domain/repositories/dashboardRepository";
import { GetDashboardUseCase } from "../../domain/usecases/getDashboardStatsUseCase";

const dashboardRepository = new DashboardRepository();
const getDashboardUseCase = new GetDashboardUseCase(dashboardRepository);

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await getDashboardUseCase.execute();

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};
