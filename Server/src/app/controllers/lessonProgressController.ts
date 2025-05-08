import { Request, Response } from "express";
import { LessonProgressRepository } from "../../domain/repositories/lessonProgressRepository";
import { UpdateLessonProgressUseCase } from "../../domain/usecases/updateLessonProgressUseCase";
import { IUser } from "../../domain/entities/User";
import { FetchLessonProgressUseCase } from "../../domain/usecases/fetchLessonProgressUseCase";

const lessonProgressRepository = new LessonProgressRepository();
const updateLessonProgressUseCase = new UpdateLessonProgressUseCase(
  lessonProgressRepository
);
const fetchLessonProgressUseCase = new FetchLessonProgressUseCase(
  lessonProgressRepository
);

export const updateLessonProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      throw new Error("User not found");
    }

    const userId = user._id.toString();
    const { courseId, lessonId } = req.params;
    if (!courseId || !lessonId) {
      throw new Error("CourseId or lessonId not found");
    }
    const { isCompleted, playbackPosition } = req.body;

    const progress = await updateLessonProgressUseCase.execute(
      userId,
      courseId,
      lessonId,
      isCompleted,
      playbackPosition
    );

    res
      .status(200)
      .json({ message: "Leson progress updated successfully", progress });
  } catch (error) {
    res.status(500).json({ message: "Error updating progress" });
  }
};

export const getLessonProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      throw new Error("No course id found");
    }
    const user = req.user as IUser;
    if (!user || !user._id) {
      throw new Error("No user found");
    }

    const userId = user._id.toString();

    const progress = await fetchLessonProgressUseCase.execute(userId, courseId);

    if (!progress) {
      throw new Error("Lesson progress not found");
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch lesson progress" });
  }
};
