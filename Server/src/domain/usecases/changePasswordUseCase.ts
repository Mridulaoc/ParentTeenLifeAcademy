import { IUser } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";
import bcrypt from "bcrypt";

export interface IChangePasswordInputs {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface IChangePasswordResponse {
  success: boolean;
  message: string;
}

export class ChangePasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: IChangePasswordInputs): Promise<IChangePasswordResponse> {
    try {
      const user = await this.userRepository.findById(data.userId);
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await this.userRepository.verifyPassword(
        user.password as string,
        data.oldPassword
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }

      if (data.oldPassword === data.newPassword) {
        return {
          success: false,
          message: "New password must be different from the current password",
        };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(data.newPassword, salt);
      await this.userRepository.updatePassword(data.userId, hashedNewPassword);

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to change password",
      };
    }
  }
}
