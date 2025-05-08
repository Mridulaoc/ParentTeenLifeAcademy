import { ILessonProgress } from "../entities/LessonProgress";
import { LessonProgressRepository } from "../repositories/lessonProgressRepository";

export class FetchLessonProgressUseCase {
  constructor(private lessonProgressRepository: LessonProgressRepository) {}

  async execute(
    userId: string,
    courseId: string
  ): Promise<ILessonProgress[] | null> {
    try {
      const progress = await this.lessonProgressRepository.fetchLessonProgress(
        courseId,
        userId
      );

      return progress;
    } catch (error) {
      throw new Error("Failed to fetch lesson progress");
    }
  }
}
