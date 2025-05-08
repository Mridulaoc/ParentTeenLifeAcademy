import { BundleModel } from "../../infrastructure/database/courseBundleModel";
import { CourseModel } from "../../infrastructure/database/courseModel";
import { OrderModel } from "../../infrastructure/database/orderModel";
import { ReviewModel } from "../../infrastructure/database/reviewModel";
import { UserModel } from "../../infrastructure/database/userModel";
import { IDashboardStats, IMonthlyData } from "../entities/dashboard";

export interface IDashboardRepository {
  getDashboardStats(): Promise<IDashboardStats>;
}

export class DashboardRepository implements IDashboardRepository {
  async getDashboardStats(): Promise<IDashboardStats> {
    try {
      const totalStudents = await UserModel.countDocuments({
        enrolledCourses: { $exists: true, $not: { $size: 0 } },
      });
      const totalOrders = await OrderModel.countDocuments({
        status: "Completed",
        paymentStatus: "Payment Successful",
      });

      const totalCourses = await CourseModel.countDocuments();
      const totalBundles = await BundleModel.countDocuments();
      const totalReviews = await ReviewModel.countDocuments();
      const totalUsers = await UserModel.countDocuments({ isBlocked: false });

      const revenueResult = await OrderModel.aggregate([
        {
          $match: { status: "Completed", paymentStatus: "Payment Successfull" },
        },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]);

      const totalRevenue =
        revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

      const currentYear = new Date().getFullYear();
      const monthlySalesData = await this.getMonthlyData(currentYear, "count");
      const monthlyRevenueData = await this.getMonthlyData(currentYear, "sum");

      return {
        totalStudents,
        totalCourses,
        totalReviews,
        totalRevenue,
        totalBundles,
        totalUsers,
        monthlySalesData,
        monthlyRevenueData,
      };
    } catch (error) {
      throw error;
    }
  }
  private async getMonthlyData(
    year: number,
    aggregationType: "count" | "sum"
  ): Promise<IMonthlyData[]> {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const aggregation =
      aggregationType === "count" ? { $sum: 1 } : { $sum: "$amount" };

    const monthlyData = await OrderModel.aggregate([
      {
        $match: {
          status: "Completed",
          paymentStatus: "Payment Successfull",
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          value: aggregation,
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result: IMonthlyData[] = [];
    for (let i = 1; i <= 12; i++) {
      const monthData = monthlyData.find((data) => data._id === i);
      result.push({
        month: monthNames[i - 1],
        value: monthData ? monthData.value : 0,
      });
    }

    return result;
  }
}
