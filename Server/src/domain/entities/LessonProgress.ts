import { ObjectId } from "mongoose";

export interface ILessonProgress {
  userId: string | ObjectId;
  courseId: string | ObjectId;
  lessonId: string | ObjectId;
  isCompleted: boolean;
  completedAt: Date;
  playbackPosition: number;
  cratedAt?: Date;
}
