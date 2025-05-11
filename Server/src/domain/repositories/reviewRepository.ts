import { CourseModel } from "../../infrastructure/database/courseModel";
import { ReviewModel } from "../../infrastructure/database/reviewModel";
import { IReview } from "../entities/Review";

export interface IReviewRepository {
  addReview(review: IReview): Promise<IReview>;
  fetchCourseReviews(
    courseId: string,
    page: number,
    limit: number
  ): Promise<{ reviews: IReview[]; total: number }>;
  updateReview(
    reviewId: string,
    reviewData: Partial<IReview>
  ): Promise<IReview | null>;
  deleteReview(reviewId: string): Promise<void>;
  fetchAllReviews(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ reviews: IReview[]; totalReviews: number }>;
}

export class ReviewRepository implements IReviewRepository {
  private updateReviewStats(course: any, newRating: number): void {
    const currentTotalReviews = course.reviewStats?.totalReviews || 0;
    const currentAverageRating = course.reviewStats?.averageRating || 0;
    const newTotalReviews = currentTotalReviews + 1;
    const newAverageRating =
      (currentAverageRating * currentTotalReviews + newRating) /
      newTotalReviews;

    const ratingDistribution = course.reviewStats?.ratingDistribution || {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (newRating >= 1 && newRating <= 5) {
      ratingDistribution[newRating as keyof typeof ratingDistribution] += 1;
    } else {
      throw new Error("Invalid rating value");
    }

    course.reviewStats = {
      totalReviews: newTotalReviews,
      averageRating: newAverageRating,
      ratingDistribution,
    };
  }

  async addReview(review: IReview): Promise<IReview> {
    try {
      const newReview = await ReviewModel.create(review);
      const courseId = review.courseId;
      const newRating = review.rating;

      const course = await CourseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      this.updateReviewStats(course, newRating);

      await course.save();

      return newReview;
    } catch (error) {
      console.error("Error in addReview:", error);
      throw new Error("Failed to add review");
    }
  }

  async fetchCourseReviews(
    courseId: string,
    page: number,
    limit: number
  ): Promise<{ reviews: IReview[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const reviews = await ReviewModel.find({ courseId })
        .populate("userId")
        .skip(skip)
        .limit(limit);
      const total = await ReviewModel.countDocuments({ courseId });

      return { reviews, total };
    } catch (error) {
      throw new Error("Failed to fetch Reviews");
    }
  }

  async updateReview(
    reviewId: string,
    reviewData: Partial<IReview>
  ): Promise<IReview | null> {
    try {
      const oldReview = await ReviewModel.findById(reviewId);
      if (!oldReview) {
        throw new Error("Review not found");
      }
      const updatedReview = await ReviewModel.findByIdAndUpdate(
        reviewId,
        { $set: reviewData },
        { new: true }
      );
      if (!updatedReview) {
        throw new Error("Failed to update review");
      }
      const courseId = updatedReview.courseId;
      const oldRating = oldReview.rating;
      const newRating = updatedReview.rating;
      const course = await CourseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      const currentTotalReviews = course.reviewStats?.totalReviews || 0;
      const currentAverageRating = course.reviewStats?.averageRating || 0;

      const newAverageRating =
        (currentAverageRating * currentTotalReviews - oldRating + newRating) /
        currentTotalReviews;
      const ratingDistribution = course.reviewStats?.ratingDistribution || {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      ratingDistribution[oldRating as keyof typeof ratingDistribution] -= 1;
      ratingDistribution[newRating as keyof typeof ratingDistribution] += 1;
      course.reviewStats = {
        totalReviews: currentTotalReviews,
        averageRating: newAverageRating,
        ratingDistribution,
      };
      await course.save();
      return updatedReview;
    } catch (error) {
      throw new Error(`Failed to update review`);
    }
  }
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        throw new Error("Review not found");
      }
      const courseId = review.courseId;
      const deletedRating = review.rating;
      await ReviewModel.findByIdAndDelete(reviewId);
      const course = await CourseModel.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      const currentTotalReviews = course.reviewStats?.totalReviews || 0;
      const currentAverageRating = course.reviewStats?.averageRating || 0;
      const newTotalReviews = currentTotalReviews - 1;
      const newAverageRating =
        newTotalReviews === 0
          ? 0
          : (currentAverageRating * currentTotalReviews - deletedRating) /
            newTotalReviews;
      const ratingDistribution = course.reviewStats?.ratingDistribution || {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      ratingDistribution[deletedRating as keyof typeof ratingDistribution] -= 1;
      course.reviewStats = {
        totalReviews: newTotalReviews,
        averageRating: newAverageRating,
        ratingDistribution,
      };
      await course.save();
    } catch (error) {
      throw new Error(`Failed to delete review`);
    }
  }

  async fetchAllReviews(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ reviews: IReview[]; totalReviews: number }> {
    try {
      const skip = (page - 1) * limit;

      const matchingCourses = await CourseModel.find({
        title: { $regex: searchTerm, $options: "i" },
      }).select("_id");

      const courseIds = matchingCourses.map((course) => course._id);

      const filter = searchTerm ? { courseId: { $in: courseIds } } : {};

      const totalReviews = await ReviewModel.countDocuments(filter);

      const reviews = await ReviewModel.find(filter)
        .populate("courseId")
        .populate("userId")
        .skip(skip)
        .limit(limit);
      return {
        reviews,
        totalReviews,
      };
    } catch (error) {
      return { reviews: [], totalReviews: 0 };
    }
  }
}
