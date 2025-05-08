import axios, { AxiosResponse } from "axios";
import {
  IChangePasswordInputs,
  IChangePasswordResponse,
  ICheckStatusResponse,
  IEnrolledCourse,
  IEnrollmentStatusResponse,
  IForgotPasswordResponse,
  IGoogleLoginResponse,
  ILoginData,
  IRegisterUserResponse,
  IRegistrationData,
  IResetPasswordData,
  IResetPasswordResponse,
  IUpdateUserInput,
  IUser,
  IUserLoginResponse,
  IUserProfileResponse,
  IVerifyOTPData,
  IVerifyOTPDataResponse,
} from "../Types/userTypes";
import { userApi } from "../Utils/api";

export const userService = {
  register: (
    userData: IRegistrationData
  ): Promise<AxiosResponse<IRegisterUserResponse>> => {
    return userApi.post("/register", userData);
  },

  userLogin: (
    loginData: ILoginData
  ): Promise<AxiosResponse<IUserLoginResponse>> => {
    return userApi.post("/login", loginData);
  },

  userGoogleLogin: (
    googleToken: string
  ): Promise<AxiosResponse<IGoogleLoginResponse>> => {
    return userApi.post("/auth/google/token", { token: googleToken });
  },

  fetchUserProfile: (): Promise<AxiosResponse<IUserProfileResponse>> => {
    return userApi.get("/profile");
  },

  updateProfile: (
    userData: IUpdateUserInput
  ): Promise<AxiosResponse<IUser>> => {
    return userApi.patch("/settings", userData);
  },

  updateProfileImg: (file: File) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    return userApi.patch("/upload-profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  forgotPassword: (
    email: string
  ): Promise<AxiosResponse<IForgotPasswordResponse>> => {
    return userApi.post("/forgot-password", { email });
  },

  verifyOTP: (
    data: IVerifyOTPData
  ): Promise<AxiosResponse<IVerifyOTPDataResponse>> => {
    return userApi.post("/verify-password-reset-otp", data);
  },

  resetPassword: (
    data: IResetPasswordData
  ): Promise<AxiosResponse<IResetPasswordResponse>> => {
    return userApi.post("/reset-password", data);
  },

  checkStatus: async (): Promise<ICheckStatusResponse> => {
    const token = localStorage.getItem("jwtToken");
    const response = await userApi.get("/check-status", {
      headers: {
        Authorization: ` Bearer ${token}`,
      },
    });
    return response.data;
  },

  fetchEnrolledCourses: async (): Promise<AxiosResponse<IEnrolledCourse[]>> => {
    try {
      const response = await userApi.get(`/enrolled-courses`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching enrolled courses."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  getEnrollmentStatus: async (
    courseId: string
  ): Promise<AxiosResponse<IEnrollmentStatusResponse>> => {
    try {
      const response = await userApi.get(`enrollment/status/${courseId}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching enrollment status."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  changePassword: async (
    data: IChangePasswordInputs
  ): Promise<AxiosResponse<IChangePasswordResponse>> => {
    try {
      const response = await userApi.post("/change-password", data);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw error;
    }
  },
};
