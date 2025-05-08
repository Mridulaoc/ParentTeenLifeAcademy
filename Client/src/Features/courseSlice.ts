import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  IAddCourseResponse,
  ICourse,
  ICourseDetailsInput,
  ICourseFormData,
  ICourseFormState,
  ICourseUpdateData,
  IFetchCoursesInputs,
  IFetchCoursesResponse,
  IFetchPublicCourseInputs,
  IGenerateCertificateResponse,
  ILessonProgress,
  IUpdateLessonProgressInputs,
  IUpdateLessonProgressResponse,
} from "../Types/courseTypes";
import { courseService } from "../Services/courseService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

export const initialState: ICourseFormState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 5,
  lessonProgress: null,
  lessonsProgress: {},
  certificate: null,
  certificateLoading: false,
  certificateError: null,
  search: "",
  category: "",
  sort: "",
};

// thunk for uploading the featured image
export const uploadFeaturedImage = createAsyncThunk(
  "course/uploadFeaturedImage",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await courseService.uploadFeaturedImage(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for uploading the intro video
export const uploadIntroVideo = createAsyncThunk(
  "course/uploadIntroVideo",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await courseService.uploadIntroVideo(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);
// Thunk for adding new course
export const addCourse = createAsyncThunk<
  IAddCourseResponse,
  ICourseFormData,
  {
    rejectValue: { message: string };
  }
>(
  "course/addCourse",
  async (courseData: ICourseFormData, { rejectWithValue }) => {
    try {
      const response = await courseService.addNewCourse(courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for fetching courses

export const fetchCourses = createAsyncThunk<
  IFetchCoursesResponse,
  IFetchCoursesInputs,
  { rejectValue: { message: string } }
>("course/fetchCourses", async (params, { rejectWithValue }) => {
  try {
    const response = await courseService.fetchCourses(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// thunk for fetching all public courses in user side

export const fetchAllPublicCourses = createAsyncThunk<
  IFetchCoursesResponse,
  IFetchPublicCourseInputs,
  { rejectValue: { message: string } }
>("course/fetchAllPublicCourses", async (params, { rejectWithValue }) => {
  try {
    const response = await courseService.fetchPublicCourses(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// thunk for fetching course details

export const fetchCourseDetails = createAsyncThunk<
  ICourse,
  ICourseDetailsInput,
  { rejectValue: { message: string } }
>(
  "/course/fetchCourseDetails",
  async ({ courseId, admin }: ICourseDetailsInput, { rejectWithValue }) => {
    try {
      const response = await courseService.fetchCourseDetails({
        courseId,
        admin,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for updating course details

export const updateCourse = createAsyncThunk<
  { message: string; course: ICourse },
  { courseId: string; courseData: ICourseUpdateData },
  { rejectValue: { message: string } }
>(
  "course/updateCourse",
  async ({ courseId, courseData }, { rejectWithValue }) => {
    try {
      const response = await courseService.updateCourse(courseData, courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for deleting a course
export const deleteCourse = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: { message: string } }
>("course/deleteCourse", async (courseId: string, { rejectWithValue }) => {
  try {
    const response = await courseService.deleteCourse(courseId);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// thunk for updating lessons progress
export const updateLessonProgress = createAsyncThunk<
  IUpdateLessonProgressResponse,
  IUpdateLessonProgressInputs,
  { rejectValue: { message: string } }
>(
  "course/updateLessonProgress",
  async (
    {
      courseId,
      lessonId,
      isCompleted,
      playbackPosition,
    }: IUpdateLessonProgressInputs,
    { rejectWithValue }
  ) => {
    try {
      const response = await courseService.updateLessonProgress({
        courseId,
        lessonId,
        isCompleted,
        playbackPosition,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for fetching lesson progress

export const fetchLessonProgress = createAsyncThunk<
  ILessonProgress[],
  string,
  { rejectValue: { message: string } }
>("course/fetchLessonProgress", async (courseId, { rejectWithValue }) => {
  try {
    const response = await courseService.fetchLessonProgress(courseId);

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});
// thunk for generating certificate
export const generateCertificate = createAsyncThunk<
  IGenerateCertificateResponse,
  string,
  { rejectValue: { message: string } }
>(
  "course/generateCertificate",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await courseService.generateCertificate(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for fetching popular courses
export const fetchPopularCourses = createAsyncThunk<
  ICourse[],
  number,
  { rejectValue: { message: string } }
>(
  "course/fetchPopularCourses",
  async (limit: number = 3, { rejectWithValue }) => {
    try {
      const response = await courseService.fetchPopularCourses(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setLessonsProgress: (state, action) => {
      state.lessonsProgress = { ...action.payload };
    },
    updateLessonProgressLocal: (state, action) => {
      const { lessonId, isCompleted, playbackPosition } = action.payload;
      if (!state.lessonsProgress) {
        state.lessonsProgress = {};
      }

      state.lessonsProgress = {
        ...state.lessonsProgress,
        [lessonId]: {
          isCompleted:
            isCompleted ??
            state.lessonsProgress[lessonId]?.isCompleted ??
            false,
          playbackPosition:
            playbackPosition ??
            state.lessonsProgress[lessonId]?.playbackPosition ??
            0,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Featured Image upload
      .addCase(uploadFeaturedImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadFeaturedImage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadFeaturedImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Intro Video upload
      .addCase(uploadIntroVideo.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadIntroVideo.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadIntroVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // add course
      .addCase(addCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCourse.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not add course";
      })
      // fetchCourses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch courses";
      })

      // fetch all public courses

      .addCase(fetchAllPublicCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPublicCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.search = action.meta.arg.search || "";
        state.category = action.meta.arg.category || "";
        state.sort = action.meta.arg.sort || "";
      })
      .addCase(fetchAllPublicCourses.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch all public courses";
      })

      // fetch course details
      .addCase(fetchCourseDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch course";
      })
      // updateCourse
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload.course;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || " Could not update the course";
      })

      // deleting course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;

        state.courses = state.courses.filter(
          (course) => course._id !== action.meta.arg
        );
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not delete the course";
      })
      .addCase(updateLessonProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        state.loading = false;
        const { lessonId, isCompleted } = action.payload.progress;
        state.lessonsProgress = {
          ...state.lessonsProgress,
          [lessonId]: {
            ...state.lessonsProgress[lessonId],
            isCompleted,
          },
        };
      })
      .addCase(updateLessonProgress.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not update lesson progress";
      })
      // fetching lesson progress
      .addCase(fetchLessonProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonProgress.fulfilled, (state, action) => {
        state.loading = false;

        const lessonsProgressMap = action.payload.reduce((acc, progress) => {
          acc[progress.lessonId] = progress;
          return acc;
        }, {} as Record<string, ILessonProgress>);

        state.lessonsProgress = lessonsProgressMap;
      })
      .addCase(fetchLessonProgress.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch lesson progress";
      })
      // Certificate generation
      .addCase(generateCertificate.pending, (state) => {
        state.certificateLoading = true;
        state.certificateError = null;
      })
      .addCase(generateCertificate.fulfilled, (state, action) => {
        state.certificateLoading = false;
        state.certificate = action.payload.certificate;
      })
      .addCase(generateCertificate.rejected, (state, action) => {
        state.certificateLoading = false;
        state.certificateError =
          action.payload?.message || "Could not generate certificate";
      })
      // Fetching popular courses
      .addCase(fetchPopularCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchPopularCourses.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch popular courses";
      });
  },
});

export default courseSlice.reducer;
