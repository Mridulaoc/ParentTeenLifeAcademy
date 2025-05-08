import { IOrder } from "../entities/order";
import { OrderRepository } from "../repositories/orderRepository";

export interface ISalesPeriodData {
  period: string;
  orders: number;
  revenue: number;
}

export interface ISalesReportSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

export interface ISalesReport {
  summary: ISalesReportSummary;
  monthlyData: ISalesPeriodData[];
}

export class GetSalesReportUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(startDate: Date, endDate: Date): Promise<ISalesReport> {
    const orders = await this.orderRepository.findOrdersByDateRange(
      startDate,
      endDate,
      "Completed",
      "Payment Successfull"
    );

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const daysDifference = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let periodFormat: (date: Date) => string;
    if (daysDifference <= 1) {
      periodFormat = (date) => `${String(date.getHours()).padStart(2, "0")}:00`;
    } else if (daysDifference <= 7) {
      periodFormat = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
    } else {
      periodFormat = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
    const groupedData: {
      [key: string]: ISalesPeriodData;
    } = {};

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt!);
      const period = periodFormat(orderDate);

      if (!groupedData[period]) {
        groupedData[period] = {
          period,
          orders: 0,
          revenue: 0,
        };
      }

      groupedData[period].orders += 1;
      groupedData[period].revenue += order.amount;
    });

    const dataArray = Object.values(groupedData);
    dataArray.sort((a, b) => a.period.localeCompare(b.period));

    return {
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
      },
      monthlyData: dataArray,
    };
  }
}
