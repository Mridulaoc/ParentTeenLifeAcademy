import { IUser } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";

export class UpdateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      const updatedUser = await this.userRepository.updateUser(userId, data);
      if (!updatedUser) {
        throw new Error("Could not update user");
      }
      return updatedUser;
    } catch (error) {}
    return null;
  }
}
