import { LessonRepository } from "../repositories/lessonRepository";

export class DeleteLessonUseCase {
  constructor(private lessonRepository: LessonRepository) {}

  async execute(
    lessonId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const lesson = await this.lessonRepository.findById(lessonId);
      if (!lesson) {
        return { success: false, message: "Lesson not found." };
      }

      const deleted = await this.lessonRepository.delete(lessonId);
      if (!deleted) {
        return { success: false, message: "Failed to delete lesson." };
      }
      return { success: true, message: "Lesson deleted successfully." };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the lesson",
      };
    }
  }
}
