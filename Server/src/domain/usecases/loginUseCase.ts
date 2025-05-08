import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";
import { generateToken } from "../../infrastructure/services/jwtService";

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async login(
    email: string,
    password: string
  ): Promise<{ message: string; userId: string; token: string }> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error("Invalid email or password");
      }
      if (user.isBlocked) {
        throw new Error(
          "Your account has been blocked. Please contact support"
        );
      }

      if (!user.password) {
        throw new Error("Invalid email or password");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid password or email");
      }
      if (!user.isVerified) throw new Error("The user is not verified");
      const userId: string = user._id.toString();
      const token = generateToken(user);
      return { message: "Login successful", userId, token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  }
}
