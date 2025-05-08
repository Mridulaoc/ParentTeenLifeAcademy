import { Request, Response, NextFunction } from "express";
import {
  verifyToken,
  JwtPayloadExtended,
} from "../../infrastructure/services/jwtService";
import { IUser } from "../../domain/entities/User";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Authorization header missing or invalid" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as JwtPayloadExtended;

    if (!decoded || !decoded.userId) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    const user: IUser = {
      _id: decoded.userId,
      email: decoded.email,
      firstName: "",
      lastName: "",
      username: "",
      isVerified: decoded.isVerified,
      signInMethod: "",
      isBlocked: decoded.isBlocked,
    };

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
