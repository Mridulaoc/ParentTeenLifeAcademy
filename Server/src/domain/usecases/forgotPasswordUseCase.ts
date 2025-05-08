import { generateOTP } from "../../infrastructure/services/otpServices";
import { IUser } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";

export class ForgotPasswordUseCase {
  constructor(private userRepository: UserRepository) {}
  async execute(email: string): Promise<IUser | null> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new Error("User with this email not found");
      }

      if (user.signInMethod === "google") {
        throw new Error("Please use Google Sign-In to access your account");
      }

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      const updatedUser = await this.userRepository.update(user);
      if (!updatedUser) {
        throw new Error("Error updating user");
      }
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}
