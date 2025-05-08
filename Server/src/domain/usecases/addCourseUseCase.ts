import { ICourse } from "../entities/Course";
import { CourseRepository } from "../repositories/courseRepository";

export class AddCourseUseCase {
  constructor(private courseRepository: CourseRepository) {}

  async execute(
    courseData: Omit<ICourse, "_id">
  ): Promise<{ courseId: string; message: string }> {
    try {
      const result = await this.courseRepository.create(courseData);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
    return { courseId: "", message: "Could not add basic details" };
  }
}
