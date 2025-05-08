import { IEnrolledCourse } from "../entities/User";
import { UserRepository } from "../repositories/userRepository";

export class GetEnrolledCoursesUseCase {
  constructor(private userRepository: UserRepository) {}
  async execute(userId: string): Promise<IEnrolledCourse[] | null> {
    try {
      const enrolledCourses = await this.userRepository.getEnrolledCourses(
        userId
      );
      return enrolledCourses;
    } catch (error) {
      throw new Error("Error in fetching enrolled courses");
    }
  }
}
