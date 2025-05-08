import { IOrder } from "../entities/order";
import { OrderRepository } from "../repositories/orderRepository";

export class GetAllOrdersUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(
    page: number,
    limit: number
  ): Promise<{ orders: IOrder[]; total: number }> {
    try {
      const result = await this.orderRepository.findAllOrders(page, limit);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
