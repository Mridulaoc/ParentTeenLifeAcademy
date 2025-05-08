import { model, Schema, Types } from "mongoose";
import { ILesson } from "../../domain/entities/lesson";

const lessonSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

export const LessonModel = model<ILesson>("Lesson", lessonSchema);
