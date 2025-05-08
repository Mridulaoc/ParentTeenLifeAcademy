import { IUser } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";

export class FetchFromCartUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<IUser | null> {
    try {
      const user = await this.userRepository.getCart(userId);
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch cart");
    }
  }
}
