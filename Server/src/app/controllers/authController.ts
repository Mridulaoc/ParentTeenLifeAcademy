import { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "../../domain/usecases/registerUserUseCase";
import { VerifyOTPUseCase } from "../../domain/usecases/verifyOTPUseCase";
import { ResendOTPUseCase } from "../../domain/usecases/resendOTPUseCase";
import { UserRepository } from "../../domain/repositories/userRepository";
import {
  generateToken,
  JwtPayloadExtended,
  verifyToken,
} from "../../infrastructure/services/jwtService";
import { sendOTPEmail } from "../../infrastructure/services/emailService";
import { LoginUseCase } from "../../domain/usecases/loginUseCase";
import { GoogleAuthUseCase } from "../../domain/usecases/googleAuthUseCase";
import { OAuth2Client } from "google-auth-library";
import { UserModel } from "../../infrastructure/database/userModel";
import { GetEnrollmentStatusUseCase } from "../../domain/usecases/getEnrolledStatusUseCase";
import { IUser } from "../../domain/entities/User";
import {
  ChangePasswordUseCase,
  IChangePasswordInputs,
} from "../../domain/usecases/changePasswordUseCase";

const userRepository = new UserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const verifyOTPUseCase = new VerifyOTPUseCase(userRepository);
const resendOTPUseCase = new ResendOTPUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository);
const googleAuthUseCase = new GoogleAuthUseCase(userRepository);
const getEnrollmentStatusUseCase = new GetEnrollmentStatusUseCase(
  userRepository
);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository);

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

export interface IGoogleProfile {
  emails?: Array<{ value: string }>;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  id: string;
  photos?: Array<{ value: string }>;
}

// Registering User
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newUser = await registerUserUseCase.execute(req.body);
    if (newUser) {
      const token = generateToken(newUser);
      if (newUser.otp) await sendOTPEmail(newUser.email, newUser.otp);

      res.status(201).json({
        message: "User registered successfully. OTP sent to email.",
        userId: newUser._id,
        token,
      });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Verifying OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, otp } = req.body;
    const result = await verifyOTPUseCase.verifyAndUpdate(userId, otp);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message;

      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

// Resending OTP

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    const user = await resendOTPUseCase.resendOTP(userId);
    if (user) {
      if (user.otp) await sendOTPEmail(user.email, user.otp);
      res.status(200).json({ message: "OTP resent successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred while resending OTP" });
  }
};

// Logging in function

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await loginUseCase.login(email, password);
    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "The user is not verified") {
        res.status(401).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

// Google token verification
export const tokenVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new Error("Token is required");
      return;
    }
    req.headers.authorization = `Bearer ${token}`;
    await googleAuth(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify Google token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Google authentication after successfull token verification
export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.body.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json({ error: "Google token is required." });
      return;
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        res.status(401).json({ message: "Invalid token payload" });
        return;
      }

      const profile: IGoogleProfile = {
        emails: [{ value: payload.email }],
        name: {
          givenName: payload.given_name || "",
          familyName: payload.family_name || "",
        },
        id: payload.sub,
        photos: payload.picture ? [{ value: payload.picture }] : [],
      };
      const result = await googleAuthUseCase.findOrCreateGoogleUser(profile);
      if ("success" in result && !result.success) {
        res.status(400).json({ message: result.message });
        return;
      }
      res.status(200).json(result);
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      res.status(401).json({
        message: "Failed to verify Google token",
        error:
          verifyError instanceof Error ? verifyError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Google Authentication Error:", error);
    res.status(500).json({ error: "Failed to authenticate with Google." });
  }
};

// Checking status of the user

export const checkStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const decoded = verifyToken(token) as JwtPayloadExtended;
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
      });
      return;
    }

    res.json({ isBlocked: false });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// checking enrollment status of the user

export const getEnrollmentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const user = req.user as IUser;
    if (!user || !user._id) {
      throw new Error("User not found");
    }
    const userId = user._id.toString();
    const result = await getEnrollmentStatusUseCase.execute(userId, courseId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message || "Failed to fetch enrollment status",
      });
    }
  }
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const userId = user._id.toString();

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
      return;
    }
    if (oldPassword === newPassword) {
      res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
      });
      return;
    }
    const inputData: IChangePasswordInputs = {
      userId,
      oldPassword,
      newPassword,
    };

    const result = await changePasswordUseCase.execute(inputData);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "An error occurred while changing password",
    });
  }
};
