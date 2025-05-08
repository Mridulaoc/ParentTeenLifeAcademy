import { Request, Response } from "express";
import { LessonRepository } from "../../domain/repositories/lessonRepository";
import { AddLessonsUseCase } from "../../domain/usecases/addLessonsUseCase";
import { FetchLessonsUseCase } from "../../domain/usecases/fetchLessonsUseCase";
import { UpdateLessonUseCase } from "../../domain/usecases/updateLessonUseCase";
import { DeleteLessonUseCase } from "../../domain/usecases/deleteLessonUseCase";

const lessonRepository = new LessonRepository();
const addLessonsUseCase = new AddLessonsUseCase(lessonRepository);
const fetchLessonsUseCase = new FetchLessonsUseCase(lessonRepository);
const updateLessonUseCase = new UpdateLessonUseCase(lessonRepository);
const deleteLessonUseCase = new DeleteLessonUseCase(lessonRepository);

export const addLesssons = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { lessons } = req.body;
    if (!courseId || !lessons || !Array.isArray(lessons)) {
      res.status(400).json({
        success: false,
        message: "Invalid request. Course ID and lessons array are required.",
      });
      return;
    }

    for (const lesson of lessons) {
      if (!lesson.title || !lesson.description) {
        res.status(400).json({
          success: false,
          message: "Each lesson must have a title and description.",
        });
        return;
      }
    }

    const result = await addLessonsUseCase.execute(courseId, lessons);
    res.status(201).json({ message: "Lessons added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding lessons" });
  }
};

export const getAllLessons = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const { lessons, total } = await fetchLessonsUseCase.execute(
      courseId,
      page,
      limit
    );
    res.status(200).json({ lessons, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: "Error fetching lessons" });
  }
};

export const updateLesson = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const lessonData = req.body;
    const updatedLesson = await updateLessonUseCase.execute(
      lessonId,
      lessonData
    );

    if (!updatedLesson) {
      throw new Error("Error updating lesson");
    }
    res
      .status(200)
      .json({ lesson: updatedLesson, message: "Lesson updated successfully" });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to update lesson",
    });
  }
};

export const deleteLesson = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lessonId = req.params.lessonId;
    const result = await deleteLessonUseCase.execute(lessonId);
    if (!result.success) {
      res.status(404).json({ message: result.message });
      return;
    }
    res.status(200).json({ messsage: result.message });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to delete the lesson",
    });
  }
};
