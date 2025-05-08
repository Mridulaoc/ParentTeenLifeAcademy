import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  IAddLessonResponse,
  IFetchLessonInputs,
  IFetchLessonsResponse,
  ILessonFormData,
  ILessonState,
  IUpdateLessonInputs,
  IUpdateLessonResponse,
} from "../Types/lessonTypes";
import { lessonService } from "../Services/lessonService";

import { handleAsyncThunkError } from "../Utils/errorHandling";

export const initialState: ILessonState = {
  lessons: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 5,
};

// thunk for adding new lessons

export const addLessons = createAsyncThunk<
  IAddLessonResponse,
  { courseId: string; lessons: ILessonFormData | ILessonFormData[] },
  { rejectValue: { message: string } }
>("lessons/addLessons", async ({ courseId, lessons }, { rejectWithValue }) => {
  try {
    const lessonsArray = Array.isArray(lessons) ? lessons : [lessons];

    const response = await lessonService.addNewLesson({
      courseId,
      lessons: lessonsArray,
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// thunk for fetching lessons

export const fetchLessons = createAsyncThunk<
  IFetchLessonsResponse,
  { courseId: string; data: IFetchLessonInputs },
  { rejectValue: { message: string } }
>(
  "lessons/fetchLessons",
  async ({ courseId, data: { page, limit } }, { rejectWithValue }) => {
    try {
      const response = await lessonService.fetchLessons({
        courseId,
        data: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for updating lessons

export const updateLesson = createAsyncThunk<
  IUpdateLessonResponse,
  IUpdateLessonInputs,
  { rejectValue: { message: string } }
>(
  "lessons/updateLesson",
  async ({ lessonId, lessonData }, { rejectWithValue }) => {
    try {
      const response = await lessonService.updateLesson({
        lessonId,
        lessonData,
      });
      if (!response?.data?.lesson) {
        throw new Error("Invalid response format");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for deleting lesson

export const deleteLesson = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: { message: string } }
>("/lessons/deleteLesson", async (lessonId: string, { rejectWithValue }) => {
  try {
    const response = await lessonService.deleteLesson(lessonId);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // add lessons
      .addCase(addLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLessons.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not add lessons";
      })

      // fetch lessons

      .addCase(fetchLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.lessons = action.payload.lessons;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch lessons";
      })
      .addCase(updateLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedLesson = action.payload.lesson;
        state.lessons = state.lessons.map((lesson) =>
          lesson._id === updatedLesson._id ? updatedLesson : lesson
        );
      })
      .addCase(updateLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not update lessons";
      })
      .addCase(deleteLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.lessons = state.lessons.filter(
          (lesson) => lesson._id !== action.meta.arg
        );
      })
      .addCase(deleteLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not delete lesson";
      });
  },
});

export default lessonSlice.reducer;
