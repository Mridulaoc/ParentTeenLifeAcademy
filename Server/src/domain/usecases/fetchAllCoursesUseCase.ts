import { ICourse } from "../entities/Course";
import { CourseBundleRepository } from "../repositories/courseBundleRepository";

export class FetchAllCoursesUseCase {
  constructor(private courseBundleRepository: CourseBundleRepository) {}
  async execute(): Promise<ICourse[] | null> {
    try {
      const result = await this.courseBundleRepository.fetchAllCourses();
      if (!result) {
        throw new Error("Error fetching courses");
      }
      return result;
    } catch (error) {
      return null;
    }
  }
}
