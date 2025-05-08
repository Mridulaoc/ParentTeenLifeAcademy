import mongoose, { model, Schema } from "mongoose";
import { ICourseBundle } from "../../domain/entities/CourseBundle";

const courseBundleSchema = new Schema<ICourseBundle>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    featuredImage: {
      type: String,
      required: true,
    },

    accessType: {
      type: String,
      enum: ["lifetime", "limited"],
      default: "lifetime",
      required: true,
    },
    accessPeriodDays: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

export const BundleModel = model<ICourseBundle>("Bundle", courseBundleSchema);
