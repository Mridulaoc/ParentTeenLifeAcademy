import { ObjectId, Types } from "mongoose";

export interface ILesson {
  _id?: string | Types.ObjectId;
  courseId: string | Types.ObjectId;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  updatedAt?: Date;
  createdAt?: Date;
}
