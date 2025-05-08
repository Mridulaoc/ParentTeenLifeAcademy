import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  IOtpResponse,
  IOtpState,
  IResendOtpInputs,
  IResendOtpResponse,
} from "../Types/otpTypes";
import { otpService } from "../Services/otpService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IOtpState = {
  loading: false,
  error: null,
  successMessage: null,
};

// Async thunk for verifying OTP
export const verifyOtp = createAsyncThunk<
  IOtpResponse,
  { userId: string; otp: string },
  { rejectValue: { message: string } }
>("otp/verify", async ({ userId, otp }, { rejectWithValue }) => {
  try {
    const response = await otpService.verifyOtp({ userId, otp });
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Async thunk for resending OTP
export const resendOtp = createAsyncThunk<
  IResendOtpResponse,
  IResendOtpInputs,
  { rejectValue: { message: string } }
>("otp/resend", async ({ userId }, { rejectWithValue }) => {
  try {
    const response = await otpService.resendOtp({ userId });
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const otpSlice = createSlice({
  name: "otp",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle verify OTP actions
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Verification Failed";
      })
      // Handle resend OTP actions
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        console.error("Resend OTP error:", action.payload);
        state.loading = false;
        state.error = action.payload?.message || "Could not resend otp";
      });
  },
});

export default otpSlice.reducer;
