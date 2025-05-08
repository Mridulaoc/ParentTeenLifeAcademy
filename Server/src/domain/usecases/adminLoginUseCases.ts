import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { AdminRepository } from "../repositories/adminRepository";

export class AdminLoginUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(
    email: string,
    password: string
  ): Promise<{ message: string; adminId: string; token: string }> {
    try {
      const admin = await this.adminRepository.findByEmail(email);

      if (!admin) {
        throw new Error("Invalid credentials");
      }

      const isValidPassword = await compare(password, admin.password);

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      const token = sign(
        { adminId: admin._id, email: admin.email },
        process.env.JWT_SECRET_KEY || "your-secret-key",
        { expiresIn: "1d" }
      );

      const adminId: string = admin._id.toString();

      return { message: "Login successful", adminId, token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  }
}
