import { IOrder } from "../entities/order";
import { OrderRepository } from "../repositories/orderRepository";

export class ProcessRefundUseCase {
  constructor(private orderRepository: OrderRepository) {}
  async execute(orderId: string): Promise<IOrder> {
    try {
      const order = await this.orderRepository.updateOrderStatus(orderId);
      if (!order) {
        throw new Error("Could not update the order");
      }
      return order;
    } catch (error) {
      throw error;
    }
  }
}
