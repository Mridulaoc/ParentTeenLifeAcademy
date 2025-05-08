import { generateCertificateNumber } from "../../infrastructure/services/certificateNumberGenerator";
import { ICertificate } from "../entities/Certificate";
import { CertificateRepository } from "../repositories/certificateRepository";
import { CourseRepository } from "../repositories/courseRepository";
import { LessonProgressRepository } from "../repositories/lessonProgressRepository";

export class CertificateCreationUseCase {
  constructor(
    private certificateRepository: CertificateRepository,
    private courseRepository: CourseRepository
  ) {}

  async execute(
    userId: string,
    courseId: string
  ): Promise<ICertificate | null> {
    try {
      const course = await this.courseRepository.findCourseById(courseId);
      if (!course) {
        return null;
      }
      const certificateNumber = generateCertificateNumber(courseId);
      const certificate: ICertificate = {
        userId,
        courseId,
        issueDate: new Date(),
        certificateNumber,
      };
      const savedCertificate = await this.certificateRepository.create(
        certificate
      );

      return savedCertificate;
    } catch (error) {
      console.error("Error in GenerateCertificateUseCase:", error);
      throw error;
    }
  }
}
