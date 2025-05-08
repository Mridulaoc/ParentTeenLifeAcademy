import { BundleModel } from "../../infrastructure/database/courseBundleModel";
import { CourseModel } from "../../infrastructure/database/courseModel";
import { IUser } from "../entities/User";
import { IUserRepository } from "../repositories/userRepository";

export class AddToWishlistUseCase {
  constructor(private userRepository: IUserRepository) {}
  async execute(
    userId: string,
    itemId: string,
    itemType: "Course" | "Bundle"
  ): Promise<IUser | null> {
    try {
      if (!itemId || !itemType) {
        throw new Error("Item ID and type are required");
      }

      const user = await this.userRepository.addToWishlist(
        userId,
        itemId,
        itemType
      );
      return user;
    } catch (error) {
      return null;
    }
  }
}
