import { IReview } from "../entities/Review";
import { ReviewRepository } from "../repositories/reviewRepository";

export class FetchCourseReviewsUseCase {
  constructor(private reviewRepository: ReviewRepository) {}
  async execute(
    courseId: string,
    page: number,
    limit: number
  ): Promise<{ reviews: IReview[]; total: number }> {
    try {
      const result = await this.reviewRepository.fetchCourseReviews(
        courseId,
        page,
        limit
      );
      return result;
    } catch (error) {
      throw new Error("Could not fetch reviews");
    }
  }
}
