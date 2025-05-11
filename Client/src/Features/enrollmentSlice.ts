import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ICourseResponse,
  IEnrollmentResponse,
  IEnrollmentState,
  IUserSuggestionResponse,
} from "../Types/enrollmentTypes";
import { enrollmentService } from "../Services/enrollmentService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IEnrollmentState = {
  users: [],
  courses: [],
  userSuggestions: [],
  selectedUser: null,
  selectedCourse: null,
  userLoading: false,
  courseLoading: false,
  suggestionsLoading: false,
  enrollmentLoading: false,
  error: null,
  success: null,
};

export const fetchUserSuggestions = createAsyncThunk<
  IUserSuggestionResponse,
  string,
  { rejectValue: { message: string } }
>(
  "/enrollment/fetchUserSuggestions",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.getUserSuggestions(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const fetchCourses = createAsyncThunk<
  ICourseResponse,
  void,
  { rejectValue: { message: string } }
>("/enrollment/fetchCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await enrollmentService.getCourses();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const enrollUser = createAsyncThunk<
  IEnrollmentResponse,
  { userId: string; courseId: string; enrollmentType: string },
  { rejectValue: { message: string } }
>(
  "/enrollment/enrollUser",
  async ({ userId, courseId, enrollmentType }, { rejectWithValue }) => {
    try {
      const response = await enrollmentService.enrollUserInCourse(
        userId,
        courseId,
        enrollmentType
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload;
    },
    clearUserSuggestions: (state) => {
      state.userSuggestions = [];
    },
    resetEnrollmentState: (state) => {
      state.error = null;
      state.success = null;
      state.selectedUser = null;
      state.selectedCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSuggestions.pending, (state) => {
        state.suggestionsLoading = true;
      })
      .addCase(fetchUserSuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        state.userSuggestions = action.payload.suggestions || [];
      })
      .addCase(fetchUserSuggestions.rejected, (state, action) => {
        state.suggestionsLoading = false;
        state.error =
          action.payload?.message || "Could not fetch user suggestions";
      })
      .addCase(fetchCourses.pending, (state) => {
        state.courseLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courseLoading = false;
        state.courses = action.payload.courses;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.courseLoading = false;
        state.error = action.payload?.message || "Could not fetch courses";
      })
      .addCase(enrollUser.pending, (state) => {
        state.enrollmentLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(enrollUser.fulfilled, (state, action) => {
        state.enrollmentLoading = false;
        state.success = action.payload.message || "User enrolled successfully";
        state.selectedUser = null;
        state.selectedCourse = null;
      })
      .addCase(enrollUser.rejected, (state, action) => {
        state.enrollmentLoading = false;
        state.error = action.payload?.message || "Could not enroll user";
      });
  },
});

export const {
  setSelectedUser,
  setSelectedCourse,
  clearUserSuggestions,
  resetEnrollmentState,
} = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
