import { Schema, model } from "mongoose";
import { IAdmin } from "../../domain/entities/Admin";

const adminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  profileImg: { type: String, required: true },
});

export const AdminModel = model<IAdmin>("Admin", adminSchema);
