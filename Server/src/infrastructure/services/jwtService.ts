import jwt from "jsonwebtoken";
import { IUser } from "../../domain/entities/User";

export interface JwtPayloadExtended extends jwt.JwtPayload {
  userId: string;
  email: string;
}

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";

// Generate JWT token
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id, email: user.email, isBlocked: user.isBlocked },
    SECRET_KEY,
    {
      expiresIn: "24h",
    }
  );
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  const decoded = jwt.verify(token, SECRET_KEY) as JwtPayloadExtended;
  return decoded;
};
