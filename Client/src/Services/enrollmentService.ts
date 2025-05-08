import axios, { AxiosResponse } from "axios";
import {
  ICourseResponse,
  IEnrollmentResponse,
  IUserSuggestionResponse,
} from "../Types/enrollmentTypes";
import { adminApi } from "../Utils/api";

export const enrollmentService = {
  getUserSuggestions: async (
    query: string
  ): Promise<AxiosResponse<IUserSuggestionResponse>> => {
    try {
      const response = await adminApi.get("/enrollment/users", {
        params: { query },
      });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching user suggestions."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  getCourses: async (): Promise<AxiosResponse<ICourseResponse>> => {
    try {
      const response = await adminApi.get("/enrollment/courses");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching courses."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  enrollUserInCourse: async (
    userId: string,
    courseId: string,
    enrollmentType: string
  ): Promise<AxiosResponse<IEnrollmentResponse>> => {
    try {
      const response = await adminApi.post("/enrollment", {
        userId,
        courseId,
        enrollmentType,
      });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching courses."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
};
