import mongoose, { ObjectId } from "mongoose";

export interface ICourseBundle {
  title: string;
  description: string;
  courses: mongoose.Types.ObjectId[];
  totalPrice: number;
  discountedPrice: number;
  featuredImage: string;
  accessType: "lifetime" | "limited";
  accessPeriodDays: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}
