import { IUser } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";

export class AddToCartUseCase {
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
      if (!itemId || !itemType) {
        throw new Error("Item ID and type are required");
      }
      const updatedUser = await this.userRepository.addToCart(
        userId,
        itemId,
        itemType
      );
      if (!updatedUser) {
        throw new Error("Failed to add course to cart");
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to add course to cart");
    }
  }
}
