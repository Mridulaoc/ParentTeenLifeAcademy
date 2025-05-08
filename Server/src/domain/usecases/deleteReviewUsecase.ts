import { IReviewRepository } from "../repositories/reviewRepository";

export class DeleteReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(reviewId: string): Promise<void> {
    try {
      await this.reviewRepository.deleteReview(reviewId);
    } catch (error) {
      throw new Error(`Failed to delete review`);
    }
  }
}
