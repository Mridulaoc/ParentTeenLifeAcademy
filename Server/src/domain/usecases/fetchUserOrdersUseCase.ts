import { ObjectId } from "mongoose";
import { UserRepository } from "../repositories/userRepository";
import { IOrder } from "../entities/order";

export class FetchUserOrdersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    page: number,
    limit: number,
    userId: string
  ): Promise<{ orders: IOrder[] | null; total: number }> {
    try {
      const result = await this.userRepository.fetchUserOrders(
        page,
        limit,
        userId
      );
      if (!result) {
        throw new Error("Error fetching orders");
      }
      return result;
    } catch (error) {
      return {
        orders: [],
        total: 0,
      };
    }
  }
}
