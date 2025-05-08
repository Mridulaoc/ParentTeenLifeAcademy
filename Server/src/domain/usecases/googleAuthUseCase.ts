import { UserRepository } from "../repositories/userRepository";
import { IUser } from "../entities/User";
import { generateToken } from "../../infrastructure/services/jwtService";
import { IGoogleProfile } from "../../app/controllers/authController";

export interface IAuthenticatedUser {
  user: IUser;
  token: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
}

export class GoogleAuthUseCase {
  constructor(private userRepository: UserRepository) {}

  async findOrCreateGoogleUser(
    profile: IGoogleProfile
  ): Promise<IAuthenticatedUser | ErrorResponse> {
    try {
      const email = profile.emails ? profile.emails[0].value : "";

      let user = await this.userRepository.findByEmail(email);

      if (user?.isBlocked) {
        throw new Error(
          "Your account has been blocked. Please contact support"
        );
      }
      if (user && user.signInMethod !== "google") {
        throw new Error(
          "This email is already registered. Please use password login."
        );
      }
      if (user && user.signInMethod === "google") {
        const token = generateToken(user);
        return { user, token };
      }

      const username = email.split("@")[0];
      const newUser = await this.userRepository.create({
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName || "",
        username: username,
        email: email,
        password: "",
        googleId: profile.id,
        signInMethod: "google",
        profileImg: profile.photos ? profile.photos[0].value : "",
        isVerified: true,
        isBlocked: false,
      });

      const token = generateToken(newUser);

      return { user: newUser, token };
    } catch (error: unknown) {
      console.error("Error in findOrCreateGoogleUser:", error);

      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || "An unknown error occurred",
        };
      } else {
        return {
          success: false,
          message: "An unknown error occurred",
        };
      }
    }
  }
}
