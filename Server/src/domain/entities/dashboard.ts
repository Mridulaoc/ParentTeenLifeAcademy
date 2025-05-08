export interface IDashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalReviews: number;
  totalRevenue: number;
  totalBundles: number;
  totalUsers: number;
  monthlySalesData: IMonthlyData[];
  monthlyRevenueData: IMonthlyData[];
}

export interface IMonthlyData {
  month: string;
  value: number;
}
