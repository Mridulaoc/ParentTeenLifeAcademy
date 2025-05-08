import { ICourse } from "../entities/Course";
import { CourseRepository } from "../repositories/courseRepository";

export class FetchCoursesUseCase {
  constructor(private courseRepository: CourseRepository) {}
  async execute(
    page: number,
    limit: number
  ): Promise<{ courses: ICourse[]; total: number }> {
    try {
      const result = await this.courseRepository.fetchCourses(page, limit);

      if (!result) {
        throw new Error("Error fetching courses");
      }
      return result;
    } catch (error) {
      return {
        courses: [],
        total: 0,
      };
    }
  }
}
