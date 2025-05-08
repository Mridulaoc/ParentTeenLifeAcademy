import { CourseModel } from "../../infrastructure/database/courseModel";
import { LessonModel } from "../../infrastructure/database/lessonModel";
import { getVimeoDuration } from "../../infrastructure/services/vimeoServices";
import { ILesson } from "../entities/lesson";

export interface ILessonRepository {
  addLessons(
    courseId: string,
    lessons: Omit<ILesson, "_id" | "courseId">[]
  ): Promise<{ message: string }>;
  fetchLessons(
    courseId: string,
    page: number,
    limit: number
  ): Promise<{ lessons: ILesson[]; total: number }>;
  findById(id: string): Promise<ILesson | null>;
  updateLesson(
    id: string,
    lessonData: Partial<ILesson>
  ): Promise<ILesson | null>;
  delete(id: string): Promise<boolean>;
}

export class LessonRepository implements ILessonRepository {
  async addLessons(
    courseId: string,
    lessons: Omit<ILesson, "_id" | "courseId">[]
  ): Promise<{ message: string; lessonIds?: string[] }> {
    try {
      const lessonsToInsert = await Promise.all(
        lessons.map(async (lesson) => {
          let lessonWithDuration = { ...lesson, courseId };
          if (lesson.videoUrl && lesson.videoUrl.includes("vimeo.com")) {
            try {
              const duration = await getVimeoDuration(lesson.videoUrl);
              lessonWithDuration.duration = duration;
            } catch (durationError) {
              console.error(
                `Error getting duration for video ${lesson.videoUrl}:`,
                durationError
              );
            }
          }
          return lessonWithDuration;
        })
      );
      if (lessonsToInsert.length === 0) {
        throw new Error("No lessons to insert");
      }

      const insertedLessons = await LessonModel.insertMany(lessonsToInsert);

      const lessonIds = insertedLessons.map((lesson) => lesson._id);

      await CourseModel.findByIdAndUpdate(courseId, {
        $push: { lessons: { $each: lessonIds } },
      });
      return { message: "Lessons added successfully" };
    } catch (error) {
      if (error instanceof Error) {
        return { message: error.message };
      }
      return { message: "Unknown error occurred" };
    }
  }
  async fetchLessons(
    courseId: string,
    page: number,
    limit: number
  ): Promise<{ lessons: ILesson[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const lessons = await LessonModel.find({ courseId })
        .skip(skip)
        .limit(limit);
      if (!lessons) {
        throw new Error("Lessons not found");
      }
      const total = await LessonModel.countDocuments({ courseId });
      return { lessons, total };
    } catch (error) {
      return { lessons: [], total: 0 };
    }
  }

  async findById(id: string): Promise<ILesson | null> {
    try {
      const lesson = await LessonModel.findById(id);
      return lesson;
    } catch (error) {
      return null;
    }
  }

  async updateLesson(
    id: string,
    lessonData: Partial<ILesson>
  ): Promise<ILesson | null> {
    try {
      let dataToUpdate = { ...lessonData };
      if (lessonData.videoUrl && lessonData.videoUrl.includes("vimeo.com")) {
        try {
          const duration = await getVimeoDuration(lessonData.videoUrl);
          dataToUpdate.duration = duration;
        } catch (durationError) {
          console.error(
            `Error getting duration for video ${lessonData.videoUrl}:`,
            durationError
          );
        }
      }
      const updatedLesson = await LessonModel.findByIdAndUpdate(
        id,
        { $set: lessonData },
        { new: true }
      );
      if (!updatedLesson) {
        throw new Error("Lesson not found");
      }
      return updatedLesson;
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await LessonModel.deleteOne({ _id: id });
      return result.deletedCount === 1;
    } catch (error) {
      return false;
    }
  }
}
