import { ICourse } from "../entities/Course";
import { AdminRepository } from "../repositories/adminRepository";

export class GetAllCoursesUseCase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(): Promise<ICourse[] | null> {
    try {
      const courses = await this.adminRepository.fetchCourses();
      return courses;
    } catch (error) {
      return null;
    }
  }
}
