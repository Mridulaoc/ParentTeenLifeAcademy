import axios, { AxiosResponse } from "axios";
import { ICourse } from "../Types/courseTypes";
import { adminApi, userApi } from "../Utils/api";
import {
  IBundleUpdateData,
  ICourseBundle,
  ICreateBundleFormData,
  ICreateBundleResponse,
  IFetchBundleInputs,
  IFetchBundleResponse,
} from "../Types/courseBundleTypes";

export const courseBundleService = {
  fetchAllCourses: async (): Promise<AxiosResponse<ICourse[]>> => {
    try {
      const response = await adminApi.get("/all-courses");
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

  createBundle: async (
    data: ICreateBundleFormData
  ): Promise<AxiosResponse<ICreateBundleResponse>> => {
    try {
      const response = await adminApi.post("/bundle", data);
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

  fetchAllBundles: async (
    data: IFetchBundleInputs
  ): Promise<AxiosResponse<IFetchBundleResponse>> => {
    try {
      const api = data.admin ? adminApi : userApi;
      const response = await api.get("/bundles", { params: data });
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

  deleteBundle: async (
    bundleId: string
  ): Promise<AxiosResponse<{ message: string }>> => {
    try {
      const response = await adminApi.delete(`/bundles/${bundleId}`);
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

  fetchBundleDetails: async (
    bundleId: string
  ): Promise<AxiosResponse<ICourseBundle>> => {
    try {
      const response = await userApi.get(`/bundles/${bundleId}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching bundle."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  updateBundle: async (
    bundleData: IBundleUpdateData,
    bundleId: string
  ): Promise<AxiosResponse<{ message: string }>> => {
    try {
      const response = await adminApi.put(`/bundles/${bundleId}`, bundleData);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while updating bundledetails."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
};
