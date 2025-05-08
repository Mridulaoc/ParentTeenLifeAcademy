// src/store/userSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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
  IUserState,
  IVerifyOTPData,
  IVerifyOTPDataResponse,
} from "../Types/userTypes";
import { userService } from "../Services/userService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

interface GoogleLoginError {
  message: string;
}

const initialState: IUserState = {
  user: {
    _id: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    isVerified: false,
    otp: "",
    otpExpiry: null,
    googleId: "",
    signInMethod: "normal",
    profileImg: "",
    phone: "",
    occupation: "",
    dateOfBirth: null,
    bio: "",
    createdAt: null,
    isBlocked: false,
    enrolledBundles: [],
  },
  loading: false,
  error: null,
  successMessage: null,
  userId: null,
  token: localStorage.getItem("jwtToken") || null,
  isAuthenticated: !!localStorage.getItem("jwtToken"),
  resetPasswordUserId: null,
  enrolledCourses: [],
  isEnrolled: false,
};

// Thunk for user registraion

export const registerUser = createAsyncThunk<
  IRegisterUserResponse,
  IRegistrationData,
  { rejectValue: { message: string } }
>("user/register", async (userData: IRegistrationData, { rejectWithValue }) => {
  try {
    const response = await userService.register(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Thunk for user login

export const loginUser = createAsyncThunk<
  IUserLoginResponse,
  ILoginData,
  { rejectValue: { message: string } }
>("/user/login", async (loginData: ILoginData, { rejectWithValue }) => {
  try {
    const response = await userService.userLogin(loginData);
    if (response.status !== 200) {
      throw new Error("Unauthorized");
    }
    if (!response.data.token) {
      return rejectWithValue({ message: "No token received" });
    }
    localStorage.setItem("jwtToken", response.data.token);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Thunk for google login

export const googleLogin = createAsyncThunk<
  IGoogleLoginResponse,
  string,
  { rejectValue: GoogleLoginError }
>("user/googleAuth", async (googleToken, { rejectWithValue }) => {
  try {
    const response = await userService.userGoogleLogin(googleToken);
    if (!response.data.token) {
      return rejectWithValue({ message: "No token received" });
    }
    localStorage.setItem("jwtToken", response.data.token);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Thunk for fetching user

export const fetchUserProfile = createAsyncThunk<
  { user: IUser },
  void,
  { rejectValue: { message: string } }
>("user/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await userService.fetchUserProfile();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Thunk for updating user
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData: IUpdateUserInput, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// Thunk for updating profile image
export const uploadProfileImage = createAsyncThunk(
  "user/uploadProfileImage",
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfileImg(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// Thunk for forgot password

export const forgotPassword = createAsyncThunk<
  IForgotPasswordResponse,
  string,
  { rejectValue: { message: string } }
>("user/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const response = await userService.forgotPassword(email);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Thunk for verifying OTP

export const verifyOTP = createAsyncThunk<
  IVerifyOTPDataResponse,
  IVerifyOTPData,
  { rejectValue: { message: string } }
>("user/verifyOTP", async (data, { rejectWithValue }) => {
  try {
    const response = await userService.verifyOTP(data);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Thunk for resetting password

export const resetPassword = createAsyncThunk<
  IResetPasswordResponse,
  IResetPasswordData,
  { rejectValue: { message: string } }
>("user/resetPassword", async (data, { rejectWithValue }) => {
  try {
    const response = await userService.resetPassword(data);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Thunk for checking status of the user

export const checkStatus = createAsyncThunk<
  ICheckStatusResponse,
  void,
  { rejectValue: { message: string } }
>("user/checkStatus", async (_, { rejectWithValue }) => {
  try {
    const response = await userService.checkStatus();
    return response;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});
// thunk for fetching enrolled courses of a user
export const fetchEnrolledCourses = createAsyncThunk<
  IEnrolledCourse[],
  void,
  { rejectValue: { message: string } }
>("user/fetchEnrolledCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await userService.fetchEnrolledCourses();
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// thunk for fetching enrollment status

export const fetchEnrollmentStatus = createAsyncThunk<
  IEnrollmentStatusResponse,
  string,
  { rejectValue: { message: string } }
>(
  "user/fetchEnrollmentStatus",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await userService.getEnrollmentStatus(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const changePassword = createAsyncThunk<
  IChangePasswordResponse,
  IChangePasswordInputs,
  { rejectValue: { message: string } }
>(
  "user/change-password",
  async (data: IChangePasswordInputs, { rejectWithValue }) => {
    try {
      const response = await userService.changePassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("jwtToken");
      state.user = initialState.user;
      window.location.href = "/";
    },
    clearResetPasswordUserId: (state) => {
      state.resetPasswordUserId = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message;
        state.userId = action.payload.userId;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not register as user";
        state.successMessage = null;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Unknown error";

        state.isAuthenticated = false;
        if (
          action.payload?.message ===
          "Your account has been blocked. Please contact support"
        ) {
          localStorage.removeItem("jwtToken");
        }
      })

      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Unknown error";
      })

      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch user profile";
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.user.profileImg = action.payload.profileImageUrl;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.resetPasswordUserId = action.payload.userId;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to send OTP";
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Invalid OTP";
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.resetPasswordUserId = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to reset password";
      })
      .addCase(checkStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isBlocked) {
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem("jwtToken");
          state.user = initialState.user;
          window.location.href = "/login";
        }
      })
      .addCase(checkStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to check status";
      })
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledCourses = action.payload;
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch enrolled courses";
      })
      .addCase(fetchEnrollmentStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnrollmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isEnrolled = action.payload.isEnrolled;
      })
      .addCase(fetchEnrollmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch enrollment status";
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload?.message || "Could not change password";
      });
  },
});

export const { logout, clearResetPasswordUserId } = userSlice.actions;
export default userSlice.reducer;
