import { UserRepository } from "../repositories/userRepository";
import { generateOTP } from "../../infrastructure/services/otpServices";
import { IUser } from "../entities/User";
import bcrypt from "bcrypt";

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    user: Omit<IUser, "isVerified" | "otp" | "otpExpiry" | "isBlocked">
  ): Promise<IUser | null> {
    try {
      const existingUser = await this.userRepository.findByEmail(user.email);
      if (existingUser) {
        throw new Error("Email is already registered");
      }

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);
      const salt = await bcrypt.genSalt(10);
      if (!user.password) {
        throw new Error("Password is required");
      }
      const hashedPassword = await bcrypt.hash(user.password, salt);
      const newUser = await this.userRepository.create({
        ...user,
        password: hashedPassword,
        isVerified: false,
        isBlocked: false,
        otp,
        otpExpiry,
      });
      if (!newUser) {
        throw new Error("Could not create new user");
      }
      return newUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      return null;
    }
  }
}
