import { Schema } from "mongoose";

export interface IReview {
  courseId: Schema.Types.ObjectId | string;
  userId: Schema.Types.ObjectId | string;
  rating: number;
  title: string;
  reviewText: string;
  createdAt?: Date;
  updatedAt?: Date;
}
