import { Request, Response } from "express";

import { CertificateRepository } from "../../domain/repositories/certificateRepository";
import { CourseRepository } from "../../domain/repositories/courseRepository";
import { LessonProgressRepository } from "../../domain/repositories/lessonProgressRepository";
import { CertificateCreationUseCase } from "../../domain/usecases/certificateCreationUseCase";
import { IUser } from "../../domain/entities/User";

const certificateRepository = new CertificateRepository();
const courseRepository = new CourseRepository();
const certificateCreationUseCase = new CertificateCreationUseCase(
  certificateRepository,
  courseRepository
);

export const generateCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "User is not authenticated" });
      return;
    }

    const userId = user._id.toString();
    const { courseId } = req.params;
    if (!courseId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }

    const certificate = await certificateCreationUseCase.execute(
      userId,
      courseId
    );

    if (!certificate) {
      res.status(400).json({
        message: "Cannot generate certificate. Course is not fully completed.",
      });
      return;
    }

    res.status(200).json({
      message: "Certificate generated successfully",
      certificate,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Error generating certificate" });
  }
};
