import axios, { AxiosResponse } from "axios";
import { adminApi, userApi } from "../Utils/api";
import {
  IAddCourseResponse,
  ICourse,
  ICourseDetailsInput,
  ICourseFormData,
  ICourseImageUploadResponse,
  ICourseUpdateData,
  IFetchCoursesInputs,
  IFetchCoursesResponse,
  IFetchPublicCourseInputs,
  IGenerateCertificateResponse,
  ILessonProgress,
  IUpdateLessonProgressInputs,
  IUpdateLessonProgressResponse,
} from "../Types/courseTypes";

export const courseService = {
  uploadFeaturedImage: async (
    formData: FormData
  ): Promise<AxiosResponse<ICourseImageUploadResponse>> => {
    try {
      const response = await adminApi.post("/upload-featured-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while uploading the image."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  uploadIntroVideo: async (
    formData: FormData
  ): Promise<AxiosResponse<string>> => {
    try {
      const response = await adminApi.post("/upload-intro-video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while uploading the video."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  addNewCourse: async (
    courseData: ICourseFormData
  ): Promise<AxiosResponse<IAddCourseResponse>> => {
    try {
      const response = await adminApi.post("/courses", courseData);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while adding the course."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchCourses: async (
    data: IFetchCoursesInputs
  ): Promise<AxiosResponse<IFetchCoursesResponse>> => {
    try {
      const response = await adminApi.get("/courses", { params: data });
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

  fetchPublicCourses: async (
    data: IFetchPublicCourseInputs
  ): Promise<AxiosResponse<IFetchCoursesResponse>> => {
    try {
      const response = await userApi.get("/courses", { params: data });
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

  fetchCourseDetails: async (
    input: ICourseDetailsInput
  ): Promise<AxiosResponse<ICourse>> => {
    try {
      const api = input.admin ? adminApi : userApi;
      const response = await api.get(`/courses/${input.courseId}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching course."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  updateCourse: async (
    courseData: ICourseUpdateData,
    courseId: string
  ): Promise<AxiosResponse<{ message: string; course: ICourse }>> => {
    try {
      const response = await adminApi.put(`/courses/${courseId}`, courseData);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while updating course basic details."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  deleteCourse: async (
    courseId: string
  ): Promise<AxiosResponse<{ message: string }>> => {
    try {
      const response = await adminApi.delete(`/courses/${courseId}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while deleting the course."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  updateLessonProgress: async (
    data: IUpdateLessonProgressInputs
  ): Promise<AxiosResponse<IUpdateLessonProgressResponse>> => {
    try {
      const response = await userApi.patch(
        `/${data.courseId}/lessons/${data.lessonId}/progress`,
        {
          isCompleted: data.isCompleted,
          playbackPosition: data.playbackPosition,
        }
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while updating lesson progress."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchLessonProgress: async (
    courseId: string
  ): Promise<AxiosResponse<ILessonProgress[]>> => {
    try {
      const response = await userApi.get(`/${courseId}/lessons/progress`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching lesson progress."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  generateCertificate: async (
    courseId: string
  ): Promise<AxiosResponse<IGenerateCertificateResponse>> => {
    try {
      const response = await userApi.post(`/${courseId}/certificate`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while generating the certificate."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchPopularCourses: async (
    limit: number
  ): Promise<AxiosResponse<ICourse[]>> => {
    try {
      const response = await userApi.get("/popular-courses", {
        params: { limit },
      });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while generating the certificate."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
};
