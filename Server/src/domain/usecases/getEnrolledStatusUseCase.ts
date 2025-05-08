import { UserRepository } from "../repositories/userRepository";

export class GetEnrollmentStatusUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    userId: string,
    courseId: string
  ): Promise<{ isEnrolled: boolean }> {
    try {
      const result = await this.userRepository.isUserEnrolled(userId, courseId);
      return result;
    } catch (error) {
      console.error("Error in GetEnrollmentStatusUseCase:", error);
      return { isEnrolled: false };
    }
  }
}
