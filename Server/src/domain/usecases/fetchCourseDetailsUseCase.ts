import { ICourse } from "../entities/Course";
import { CourseRepository } from "../repositories/courseRepository";

export class FetchCourseDetailsUseCase {
  constructor(private courseRepository: CourseRepository) {}
  async execute(courseId: string): Promise<ICourse | null> {
    try {
      const course = await this.courseRepository.findCourseById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      return course;
    } catch (error) {
      return null;
    }
  }
}
