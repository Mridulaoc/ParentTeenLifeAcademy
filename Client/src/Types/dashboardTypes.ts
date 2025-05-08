export interface IDashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalBundles: number;
  totalReviews: number;
  totalUsers: number;
  totalRevenue: number;
}

export interface ISaleData {
  orderId: string;
  amount: number;
  createdAt: string;
  title: string;
}

export interface IMonthlySalesData {
  month: string;
  value: number;
}

export interface IMonthlyRevenueData {
  month: string;
  value: number;
}

export interface IDashboardState {
  stats: IDashboardStats;
  salesData: IMonthlySalesData[];
  revenueData: IMonthlyRevenueData[];
  loading: boolean;
  error: string | null;
}
