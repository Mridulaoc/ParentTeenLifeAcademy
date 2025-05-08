export interface IReviewFormData {
  rating: number;
  title: string;
  reviewText: string;
}
export interface IReviewAddResponse {
  message: string;
}

export interface IAddReviewParams {
  courseId: string;
  reviewData: IReviewFormData;
}

export interface IReview {
  _id?: string;
  courseId: string;
  userId: string;
  rating: number;
  title: string;
  reviewText: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IReviewsState {
  reviews: IReview[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalReviews: number;
}

export interface IFetchReviewParams {
  page: number;
  limit: number;
}

export interface IFetchCourseReviewResponse {
  reviews: IReview[];
  total: number;
}

export interface IFetchAllReviewsInput {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface IFetchAllReviewsResponse {
  reviews: IReview[];
  totalReviews: number;
  page: number;
  limit: number;
}
