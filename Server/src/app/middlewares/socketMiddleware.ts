import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import {
  verifyToken,
  JwtPayloadExtended as UserJwtPayload,
} from "../../infrastructure/services/jwtService";
import { AdminModel } from "../../infrastructure/database/adminModel";
import { UserModel } from "../../infrastructure/database/userModel";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "secret_key";

interface AdminJwtPayload extends jwt.JwtPayload {
  adminId: string;
  email: string;
}

interface SocketUser {
  id: string;
  email: string;
  type: "student" | "admin";
  isBlocked?: boolean;
  firstName?: string;
  lastName?: string;
  name?: string;
  profileImg?: string;
}

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token;
  const userType = socket.handshake.auth.userType;

  if (!token) {
    return next(new Error("Authentication error:Token is required"));
  }
  try {
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as AdminJwtPayload;
      if (decoded && decoded.adminId) {
        const admin = await AdminModel.findById(decoded.adminId)
          .select("name email profileImg")
          .lean();
        if (!admin) {
          return next(new Error("Authentication error: Admin not found"));
        }
        const user: SocketUser = {
          id: decoded.adminId,
          email: decoded.email,
          type: "admin",
          name: admin.name,
          profileImg: admin.profileImg,
        };
        socket.data.user = user;
        return next();
      }
    } catch (error) {
      console.log("Not an admin token");
    }
    const decoded = verifyToken(token) as UserJwtPayload;
    if (!decoded || !decoded.userId) {
      return next(new Error("Authentication error: Invalid token payload"));
    }
    const user = await UserModel.findById(decoded.userId)
      .select("firstName lastName email profileImg isVerified isBlocked")
      .lean();

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }
    if (user.isBlocked) {
      return next(new Error("Authentication error: User is blocked"));
    }
    const socketUser: SocketUser = {
      id: decoded.userId,
      email: decoded.email,
      type: "student",
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      profileImg: user.profileImg,
    };

    socket.data.user = socketUser;
    return next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication error: Invalid token"));
  }
};
