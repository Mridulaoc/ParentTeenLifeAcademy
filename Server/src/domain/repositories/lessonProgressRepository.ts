import { LessonProgressModel } from "../../infrastructure/database/lessonProgressModel";
import { ILessonProgress } from "../../domain/entities/LessonProgress";
import { CourseModel } from "../../infrastructure/database/courseModel";
import { Types } from "mongoose";
import { UserModel } from "../../infrastructure/database/userModel";

export interface ILessonProgressRepository {
  updateLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    isCompleted: boolean,
    playbackPosition: number
  ): Promise<ILessonProgress | null>;

  fetchLessonProgress(
    userId: string,
    courseId: string
  ): Promise<ILessonProgress[] | null>;
}

export class LessonProgressRepository implements ILessonProgressRepository {
  async updateLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    isCompleted: boolean,
    playbackPosition: number
  ): Promise<ILessonProgress | null> {
    try {
      const updatedProgress = await LessonProgressModel.findOneAndUpdate(
        { userId, courseId, lessonId },
        {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          playbackPosition,
        },
        { upsert: true, new: true }
      );

      const courseDetails = await CourseModel.findById(courseId).populate(
        "lessons"
      );

      const lessonProgress = await LessonProgressModel.find({
        courseId,
        userId,
      });

      const completedLessons = lessonProgress.filter(
        (progress) => progress.isCompleted
      ).length;
      const totalLessons = courseDetails?.lessons?.length;
      if (totalLessons) {
        const progressPercentage =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        await UserModel.findOneAndUpdate(
          {
            _id: userId,
            "enrolledCourses.courseId": courseId,
          },
          {
            $set: { "enrolledCourses.$.progress": progressPercentage },
          }
        );
      }

      return updatedProgress;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Couldnot update Lesson"
      );
    }
  }
  async fetchLessonProgress(
    courseId: string,
    userId: string
  ): Promise<ILessonProgress[] | null> {
    try {
      const lessonProgress = await LessonProgressModel.find({
        courseId,
        userId,
      });

      if (!lessonProgress) {
        throw new Error("Could not fetch lesson progress");
      }
      return lessonProgress;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Couldnot fetch lesson progress"
      );
    }
  }
}
