import { Request, Response, NextFunction } from "express";
import { UserModel } from "../../infrastructure/database/userModel";
import {
  verifyToken,
  JwtPayloadExtended,
} from "../../infrastructure/services/jwtService";

export const checkBlocked = async (
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

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
