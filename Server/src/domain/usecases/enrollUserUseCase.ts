import { IUser } from "../entities/User";
import { AdminRepository } from "../repositories/adminRepository";
import { CourseRepository } from "../repositories/courseRepository";
import { UserRepository } from "../repositories/userRepository";

export class EnrollUserUsecase {
  constructor(
    private adminRepository: AdminRepository,
    private userRepository: UserRepository,
    private courseRepository: CourseRepository
  ) {}

  async execute(
    userId: string,
    courseId: string,
    enrollmentType: "manual" | "auto"
  ): Promise<IUser | null> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const course = await this.courseRepository.findCourseById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      const isEnrolled = user.enrolledCourses?.some(
        (enrollment) => enrollment.courseId.toString() === courseId
      );
      if (isEnrolled) {
        throw new Error("User is already enrolled in this course");
      }
      const updatedUser = await this.adminRepository.enrollUser(
        userId,
        courseId,
        enrollmentType
      );

      if (!updatedUser) {
        throw new Error("Failed to enroll user");
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Enrollment error: ${error.message}`);
        throw error;
      }
      throw new Error("An unknown error occurred during enrollment");
    }
  }
}
