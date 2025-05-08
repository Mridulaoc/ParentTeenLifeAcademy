import { ILessonRepository } from "../repositories/lessonRepository";

export class FetchLessonsUseCase {
  constructor(private lessonRepository: ILessonRepository) {}
  async execute(courseId: string, page: number, limit: number) {
    try {
      const result = await this.lessonRepository.fetchLessons(
        courseId,
        page,
        limit
      );
      if (!result) {
        throw new Error("Error fetching lessons");
      }
      return result;
    } catch (error) {
      return { lessons: [], total: 0 };
    }
  }
}
