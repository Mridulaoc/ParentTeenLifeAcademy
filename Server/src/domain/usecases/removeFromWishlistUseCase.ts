import { IUser } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";

export class RemoveFromWishlistUsecase {
  constructor(private userRepository: UserRepository) {}
  async execute(userId: string, courseId: string): Promise<IUser | null> {
    try {
      if (!userId || !courseId) {
        throw new Error("User ID and Course ID are required");
      }
      const removed = await this.userRepository.removeFromWishlist(
        userId,
        courseId
      );
      if (!removed) {
        throw new Error("Failed to remove course from cart");
      }
      const updatedUser = await this.userRepository.findById(userId);
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to remove course from wishlist");
    }
  }
}
