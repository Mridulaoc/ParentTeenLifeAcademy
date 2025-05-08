import { IUser } from "../domain/entities/User";
import { Request } from "express";
import { IAdmin } from "../domain/entities/Admin";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      admin?: IAdmin;
    }
  }
}
