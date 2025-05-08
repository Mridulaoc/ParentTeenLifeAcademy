import { IReview } from "../entities/Review";
import { ReviewRepository } from "../repositories/reviewRepository";

export class GetAllReviewsUseCase {
  constructor(private reviewRepository: ReviewRepository) {}

  async execute(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ reviews: IReview[]; totalReviews: number }> {
    try {
      const result = await this.reviewRepository.fetchAllReviews(
        page,
        limit,
        searchTerm
      );
      if (!result) {
        throw new Error("Error fetching reviews");
      }
      return result;
    } catch (error) {
      return {
        reviews: [],
        totalReviews: 0,
      };
    }
  }
}
