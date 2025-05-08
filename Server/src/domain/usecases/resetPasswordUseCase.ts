import { UserRepository } from "../repositories/userRepository";
import bcrypt from "bcrypt";

export class ResetpasswordUseCase {
  constructor(private userRepository: UserRepository) {}
  async execute(userId: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.isVerified) {
        throw new Error("Please verify your OTP first");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await this.userRepository.update(user);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  }
}
