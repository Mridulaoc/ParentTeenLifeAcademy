import { model, Schema } from "mongoose";
import { IReview } from "../../domain/entities/Review";

const reviewSchema = new Schema<IReview>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    reviewText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ReviewModel = model<IReview>("Review", reviewSchema);
