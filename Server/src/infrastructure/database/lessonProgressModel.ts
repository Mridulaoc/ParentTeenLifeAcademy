import { Schema, model, Types } from "mongoose";
import { ILessonProgress } from "../../domain/entities/LessonProgress";

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    playbackPosition: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

lessonProgressSchema.index(
  { userId: 1, courseId: 1, lessonId: 1 },
  { unique: true }
);
lessonProgressSchema.index({ courseId: 1, userId: 1 });
export const LessonProgressModel = model<ILessonProgress>(
  "LessonProgress",
  lessonProgressSchema
);
