import { model, Schema } from "mongoose";
import { ICourse } from "../../domain/entities/Course";

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    featuredImage: {
      type: String,
    },
    introVideoUrl: {
      type: String,
    },
    whatYouWillLearn: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },

    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
        default: [],
      },
    ],
    studentsEnrolled: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    reviewStats: {
      averageRating: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      ratingDistribution: {
        type: {
          1: { type: Number, default: 0 },
          2: { type: Number, default: 0 },
          3: { type: Number, default: 0 },
          4: { type: Number, default: 0 },
          5: { type: Number, default: 0 },
        },
        default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    },
  },

  { timestamps: true }
);

export const CourseModel = model<ICourse>("Course", courseSchema);
