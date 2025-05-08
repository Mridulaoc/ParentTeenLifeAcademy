import { ICourse } from "../entities/Course";
import { CourseRepository } from "../repositories/courseRepository";

export class GetPopularCoursesUseCase {
  constructor(private courseRepository: CourseRepository) {}

  async execute(limit: number): Promise<ICourse[]> {
    return await this.courseRepository.getPopularCourses(limit);
  }
}
