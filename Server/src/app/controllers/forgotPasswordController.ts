import { Request, Response } from "express";
import { UserRepository } from "../../domain/repositories/userRepository";
import { ForgotPasswordUseCase } from "../../domain/usecases/forgotPasswordUseCase";
import { sendOTPEmail } from "../../infrastructure/services/emailService";
import { VerifyOTPUseCase } from "../../domain/usecases/verifyOTPUseCase";
import { ResetpasswordUseCase } from "../../domain/usecases/resetPasswordUseCase";

const userRepository = new UserRepository();
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository);
const verifyOTPUseCase = new VerifyOTPUseCase(userRepository);
const resetPasswordUseCase = new ResetpasswordUseCase(userRepository);

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await forgotPasswordUseCase.execute(email);
    if (user && user.otp) await sendOTPEmail(user.email, user.otp);
    res.status(200).json({
      messsage: "OTP sent successfully",
      userId: user ? user._id : null,
    });
  } catch (error: unknown) {
    if (error instanceof Error)
      res.status(400).json({ message: error.message, status: "error" });
  }
};

export const verifyResetPasswordOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, otp } = req.body;
    await verifyOTPUseCase.verifyAndUpdate(userId, otp);
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message;

      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, password } = req.body;
    await resetPasswordUseCase.execute(userId, password);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
