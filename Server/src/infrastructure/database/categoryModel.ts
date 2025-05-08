import { model, Schema } from "mongoose";
import { ICategory } from "../../domain/entities/Category";

const categorySchema = new Schema<ICategory>(
  {
    name: { type: "string", required: true },
    description: { type: "string", required: true },
    isDeleted: { type: "boolean", default: false },
  },
  { timestamps: true }
);

export const CategoryModel = model<ICategory>("Category", categorySchema);
