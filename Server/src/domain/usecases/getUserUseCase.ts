import { IUser } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<IUser | null> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      return null;
    }
  }
}
