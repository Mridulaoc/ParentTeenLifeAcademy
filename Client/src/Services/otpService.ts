import { AxiosResponse } from "axios";
import {
  IOtpInputs,
  IOtpResponse,
  IResendOtpInputs,
  IResendOtpResponse,
} from "../Types/otpTypes";
import { userApi } from "../Utils/api";

export const otpService = {
  verifyOtp: async ({
    userId,
    otp,
  }: IOtpInputs): Promise<AxiosResponse<IOtpResponse>> => {
    return userApi.post("/verify-otp", { userId, otp });
  },

  resendOtp: (
    userId: IResendOtpInputs
  ): Promise<AxiosResponse<IResendOtpResponse>> => {
    return userApi.post("/resend-otp", userId);
  },
};
