import { Request, Response, NextFunction } from "express";
import { IAdmin } from "../../domain/entities/Admin";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";
declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
    }
  }
}
interface JwtPayloadExtended extends jwt.JwtPayload {
  adminId: string;
  email: string;
}
export const adminMiddleware = async (
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

    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayloadExtended;

    if (!decoded || !decoded.adminId) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    const admin: IAdmin = {
      _id: decoded.adminId,
      email: decoded.email,
      name: "",
      password: "",
      profileImg: "",
    };

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
