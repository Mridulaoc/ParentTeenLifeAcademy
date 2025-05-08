import { Request, Response } from "express";
import fs from "fs";
import { UploadFeaturedImageUsecase } from "../../domain/usecases/uploadFeaturedImageUseCase";
import { CloudinaryUploadService } from "../../infrastructure/services/cloudinaryService";
import { UploadIntroVideoUsecase } from "../../domain/usecases/uploadIntroVideoUsecase";
import { CourseRepository } from "../../domain/repositories/courseRepository";
import { AddCourseUseCase } from "../../domain/usecases/addCourseUseCase";
import { FetchCoursesUseCase } from "../../domain/usecases/fetchCoursesUseCase";
import { FetchCourseDetailsUseCase } from "../../domain/usecases/fetchCourseDetailsUseCase";
import { UpdateCourseDetailsUseCase } from "../../domain/usecases/updateCourseDetailsUseCase";
import { DeleteCourseUsecase } from "../../domain/usecases/deleteCourseUseCase";
import { GetPublicCoursesUsecase } from "../../domain/usecases/getPublicCourseUseCase";
import { GetPopularCoursesUseCase } from "../../domain/usecases/getPopularCoursesUseCase";

const courseRepository = new CourseRepository();
const uploadService = new CloudinaryUploadService();
const uplaodFeaturedImageUsecase = new UploadFeaturedImageUsecase(
  uploadService
);
const uploadIntroVideoUseCase = new UploadIntroVideoUsecase(uploadService);
const addCourseUseCase = new AddCourseUseCase(courseRepository);
const fetchCoursesUseCase = new FetchCoursesUseCase(courseRepository);
const fetchCourseDetailsUseCase = new FetchCourseDetailsUseCase(
  courseRepository
);
const updateCourseDetailsUseCase = new UpdateCourseDetailsUseCase(
  courseRepository
);
const deleteCourseUseCase = new DeleteCourseUsecase(courseRepository);
const getPublicCourseUseCase = new GetPublicCoursesUsecase(courseRepository);
const getPopularCoursesUseCase = new GetPopularCoursesUseCase(courseRepository);

export const addNewCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await addCourseUseCase.execute(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A course with the same name already exists."
    ) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error adding basic details" });
  }
};

export const uploadFeaturedImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(404).json({ message: "No file uploaded" });
      return;
    }

    const featuredImageUrl = await uplaodFeaturedImageUsecase.execute(
      req.file.path
    );
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("Error deleting file:", err);
      }
    });

    res.status(200).json(featuredImageUrl);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: error.message || "Failed to upload featured image" });
    }
    res.status(500).json({ message: "Failed to upload featured image" });
  }
};

export const uploadIntroVideo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(404).json({ message: "No file uploaded" });
      return;
    }
    const introVideoUrl = await uploadIntroVideoUseCase.execute(req.file.path);
    res.status(200).json(introVideoUrl);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: error.message || "Failed to upload featured image" });
    }
    res.status(500).json({ message: "Failed to upload featured image" });
  }
};

export const getAllCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const { courses, total } = await fetchCoursesUseCase.execute(page, limit);

    res.status(200).json({ courses, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};

export const getAllPublicCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;

    const { search, category, sort } = req.query;

    const { total, courses } = await getPublicCourseUseCase.execute(
      page,
      limit,
      search as string,
      category as string,
      sort as string
    );

    res.status(200).json({ courses, total, page, limit });
  } catch (error) {
    console.error("Error fetching public courses:", error);
    res.status(500).json({ message: "Error fetching courses" });
  }
};
export const getCourseDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    if (!courseId) {
      throw new Error("CourseId not found");
    }
    const course = await fetchCourseDetailsUseCase.execute(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const updateCourseDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const courseData = req.body;

    const updatedCourse = await updateCourseDetailsUseCase.execute(
      courseId,
      courseData
    );

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const result = await deleteCourseUseCase.execute(courseId);
    if (!result.success) {
      res.status(404).json({ message: result.message });
      return;
    }
    res.status(200).json({ messsage: result.message });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to delete the course",
    });
  }
};

export const getPopularCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Hitting controller");
    const limit = parseInt(req.query.limit as string) || 3;
    const courses = await getPopularCoursesUseCase.execute(limit);
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch popular courses" });
  }
};
