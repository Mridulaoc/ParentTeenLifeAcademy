import axios, { AxiosResponse } from "axios";
import {
  ICreateNotificationResponse,
  IDeleteNotificationResponse,
  IFetchBundleResponse,
  IFetchCourseResponse,
  IFetchNotificationInput,
  IFetchNotificationResponse,
  IfetchTargetUsersInput,
  IFetchTargetUsersResponse,
  IFetchUserResponse,
  IMarkupAllNotificationsResponse,
  IMarkupNotificationInput,
  IMarkupNotificationResponse,
  INotificationFormData,
  IUnreadNotificationsResponse,
  IUserNotificationsInput,
  IUserNotificationsResponse,
} from "../Types/notificationTypes";
import { adminApi, userApi } from "../Utils/api";

export const notificationService = {
  getAllNotifications: async (
    data: IFetchNotificationInput
  ): Promise<AxiosResponse<IFetchNotificationResponse>> => {
    try {
      const response = await adminApi.get("/all-notifications", {
        params: data,
      });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching users."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchUsers: async (): Promise<AxiosResponse<IFetchUserResponse>> => {
    try {
      const response = await adminApi.get("/notifications/users");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching users."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  fetchCourses: async (): Promise<AxiosResponse<IFetchCourseResponse>> => {
    try {
      const response = await adminApi.get("/notifications/courses");
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

  fetchBundles: async (): Promise<AxiosResponse<IFetchBundleResponse>> => {
    try {
      const response = await adminApi.get("/notifications/bundles");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching bundles."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchTargetUsers: async ({
    entityType,
    entityId,
  }: IfetchTargetUsersInput): Promise<
    AxiosResponse<IFetchTargetUsersResponse>
  > => {
    try {
      const response = await adminApi.get(
        `/${entityType}/${entityId}/enrolledUsers`
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching target users"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  createNotification: async (
    data: INotificationFormData
  ): Promise<AxiosResponse<ICreateNotificationResponse>> => {
    try {
      const response = await adminApi.post("/notification", data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while creating notifications"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  deleteNotification: async (
    notificationId: string
  ): Promise<AxiosResponse<IDeleteNotificationResponse>> => {
    try {
      const response = await adminApi.delete(
        `/notifications/${notificationId}`
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while deleting notifications"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchUserNotifications: async (
    data: IUserNotificationsInput
  ): Promise<AxiosResponse<IUserNotificationsResponse>> => {
    try {
      const response = await userApi.get(`/${data.userId}/notifications`, {
        params: data,
      });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching user notifications"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  markNotificationAsRead: async (
    data: IMarkupNotificationInput
  ): Promise<AxiosResponse<IMarkupNotificationResponse>> => {
    try {
      const response = await userApi.put(
        `/notifications/${data.notificationId}/read`,
        null,
        {
          params: { userId: data.userId },
        }
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while marking notifications as read"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  markAllNotificationsAsRead: async (): Promise<
    AxiosResponse<IMarkupAllNotificationsResponse>
  > => {
    try {
      const response = await userApi.put(`/notifications/read`, null);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while marking all notifications as read"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  getUnreadCount: async (): Promise<
    AxiosResponse<IUnreadNotificationsResponse>
  > => {
    try {
      const response = await userApi.get(`/notifications/unread`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching unread notifications count"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
};
