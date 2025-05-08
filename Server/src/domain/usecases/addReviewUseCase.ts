import { IReview } from "../entities/Review";
import { ReviewRepository } from "../repositories/reviewRepository";

export class AddReviewUseCase {
  constructor(private reviewRepository: ReviewRepository) {}
  async execute(review: IReview): Promise<IReview> {
    try {
      return await this.reviewRepository.addReview(review);
    } catch (error) {
      throw new Error("UseCase Error: Failed to add review ");
    }
  }
}
