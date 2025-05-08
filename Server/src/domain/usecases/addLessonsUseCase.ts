import { ILesson } from "../entities/lesson";
import { ILessonRepository } from "../repositories/lessonRepository";

export class AddLessonsUseCase {
  constructor(private lessonRepository: ILessonRepository) {}

  async execute(
    courseId: string,
    lessons: Omit<ILesson, "_id" | "courseId">[]
  ): Promise<{ message: string }> {
    try {
      const result = await this.lessonRepository.addLessons(courseId, lessons);
      if (!result) {
        throw new Error(`Could not add lessons`);
      }
      return result;
    } catch (error) {
      if (error instanceof Error) {
        return { message: error.message };
      }
      return { message: "Unknown error occurred" };
    }
  }
}
