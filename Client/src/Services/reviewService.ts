import axios, { AxiosResponse } from "axios";
import {
  IFetchAllReviewsInput,
  IFetchAllReviewsResponse,
  IFetchCourseReviewResponse,
  IFetchReviewParams,
  IReviewAddResponse,
  IReviewFormData,
} from "../Types/reviewTypes";
import { adminApi, userApi } from "../Utils/api";

export const reviewService = {
  addReview: async (
    courseId: string,
    reviewData: IReviewFormData
  ): Promise<AxiosResponse<IReviewAddResponse>> => {
    try {
      const response = await userApi.post(`/${courseId}/reviews`, reviewData);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while adding review."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  fetchCourseReviews: async (
    courseId: string,
    data: IFetchReviewParams
  ): Promise<AxiosResponse<IFetchCourseReviewResponse>> => {
    try {
      const response = await userApi.get(`/${courseId}/reviews`, {
        params: data,
      });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching reviews."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  updateReview: async (
    courseId: string,
    reviewId: string,
    reviewData: IReviewFormData
  ): Promise<AxiosResponse<IReviewAddResponse>> => {
    try {
      const response = await userApi.put(
        `/${courseId}/reviews/${reviewId}`,
        reviewData
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while updating review."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  deleteReview: async (
    courseId: string,
    reviewId: string
  ): Promise<AxiosResponse<void>> => {
    try {
      const response = await userApi.delete(`/${courseId}/reviews/${reviewId}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while deleting review."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchAllReviews: async (
    params: IFetchAllReviewsInput
  ): Promise<AxiosResponse<IFetchAllReviewsResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await adminApi.get("/all-reviews", { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
