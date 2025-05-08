import { IUser } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";

export class RemoveFromCartUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    userId: string,
    itemId: string,
    itemType: "Course" | "Bundle"
  ): Promise<IUser | null> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const success = await this.userRepository.removeFromCart(
        userId,
        itemId,
        itemType
      );
      if (!success) {
        throw new Error("Failed to remove course from cart");
      }

      const updatedUser = await this.userRepository.findById(userId);
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to remove course from cart");
    }
  }
}
