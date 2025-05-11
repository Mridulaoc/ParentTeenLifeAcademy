import { Request, Response } from "express";

import { AdminRepository } from "../../domain/repositories/adminRepository";
import { CourseRepository } from "../../domain/repositories/courseRepository";
import { UserRepository } from "../../domain/repositories/userRepository";
import { EnrollUserUsecase } from "../../domain/usecases/enrollUserUseCase";
import { GetAllCoursesUseCase } from "../../domain/usecases/getAllCoursesUseCase";
import { GetUserSuggestionsUsecase } from "../../domain/usecases/getUserSuggestionsUseCase";
import { ifError } from "assert";

const userRepository = new UserRepository();
const adminRepository = new AdminRepository();
const courseRepository = new CourseRepository();
const getUserSuggestionsUsecase = new GetUserSuggestionsUsecase(
  adminRepository
);
const getAllCoursesUsecase = new GetAllCoursesUseCase(adminRepository);
const enrollUserUsecase = new EnrollUserUsecase(
  adminRepository,
  userRepository,
  courseRepository
);

export const enrollUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, courseId, enrollmentType } = req.body;
    if (!userId || !courseId) {
      res.status(400).json({ message: "Missing required fields" });
    }
    const updatedUser = await enrollUserUsecase.execute(
      userId,
      courseId,
      enrollmentType
    );

    res.status(200).json({
      message: "User enrolled successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export const getUserSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = (req.query.query as string) || "";
    const suggestions = await getUserSuggestionsUsecase.execute(query);
    res
      .status(200)
      .json({ message: "Successfully enrolled for the course", suggestions });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export const getCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await getAllCoursesUsecase.execute();

    res.status(200).json({ courses });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
};
