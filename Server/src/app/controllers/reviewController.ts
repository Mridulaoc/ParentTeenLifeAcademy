import { Request, Response } from "express";
import { ReviewRepository } from "../../domain/repositories/reviewRepository";
import { AddReviewUseCase } from "../../domain/usecases/addReviewUseCase";
import { IUser } from "../../domain/entities/User";
import { FetchCourseReviewsUseCase } from "../../domain/usecases/fetchCourseReviewsUseCase";
import { ReviewModel } from "../../infrastructure/database/reviewModel";
import { UpdateReviewUsecase } from "../../domain/usecases/updateReviewUseCase";
import { DeleteReviewUseCase } from "../../domain/usecases/deleteReviewUsecase";
import { GetAllReviewsUseCase } from "../../domain/usecases/getAllReviewsUseCase";

const reviewRepository = new ReviewRepository();
const addReviewUseCase = new AddReviewUseCase(reviewRepository);
const fetchCourseReviewUseCase = new FetchCourseReviewsUseCase(
  reviewRepository
);
const updateReviewUseCase = new UpdateReviewUsecase(reviewRepository);

const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);

const getAllReviewsUseCase = new GetAllReviewsUseCase(reviewRepository);

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { rating, title, reviewText } = req.body;

    const user = req.user as IUser;
    if (!user || !user._id) {
      throw new Error("User not found");
    }

    const userId = user._id.toString();
    const existingReview = await ReviewModel.findOne({ courseId, userId });
    if (existingReview) {
      res
        .status(400)
        .json({ message: "You have already reviewed this course." });
      return;
    }
    const review = await addReviewUseCase.execute({
      courseId,
      userId,
      rating,
      title,
      reviewText,
    });

    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Controller Error: Failed to add review",
    });
  }
};

export const fetchCourseReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const { courseId } = req.params;

    if (!courseId) {
      throw new Error("CourseId not found");
    }
    const { reviews, total } = await fetchCourseReviewUseCase.execute(
      courseId,
      page,
      limit
    );

    res.status(200).json({ reviews, total });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};
export const updateReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const reviewData = req.body;

  try {
    const updatedReview = await updateReviewUseCase.execute(
      reviewId,
      reviewData
    );
    res.status(200).json({
      message: "Review updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Review could not updated",
    });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  try {
    await deleteReviewUseCase.execute(reviewId);
    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Couldn't delete review",
    });
  }
};

export const getAllReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { searchTerm } = req.query;

    const { totalReviews, reviews } = await getAllReviewsUseCase.execute(
      page,
      limit,
      searchTerm as string
    );

    res.status(200).json({ reviews, totalReviews, page, limit });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};
