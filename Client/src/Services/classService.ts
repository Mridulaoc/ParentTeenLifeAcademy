import axios, { AxiosResponse } from "axios";
import {
  IClassDataInputs,
  IClassScheduleResponse,
  ILiveClassDetails,
} from "../Types/classTypes";
import { adminApi, userApi } from "../Utils/api";

export const classService = {
  scheduleClass: async (
    classData: IClassDataInputs
  ): Promise<AxiosResponse<IClassScheduleResponse>> => {
    try {
      const response = await adminApi.post("/schedule-class", classData);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while scheduling the class"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchClass: async (): Promise<AxiosResponse<ILiveClassDetails>> => {
    try {
      const response = await userApi.get("/class");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching class"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
};
