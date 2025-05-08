import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  IAddReviewParams,
  IFetchAllReviewsInput,
  IFetchAllReviewsResponse,
  IFetchCourseReviewResponse,
  IFetchReviewParams,
  IReviewAddResponse,
  IReviewFormData,
  IReviewsState,
} from "../Types/reviewTypes";
import { reviewService } from "../Services/reviewService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IReviewsState = {
  reviews: [],
  totalReviews: 0,
  loading: false,
  error: null,
  total: 0,
  page: 0,
  limit: 0,
};

export const addReview = createAsyncThunk<
  IReviewAddResponse,
  IAddReviewParams,
  { rejectValue: { message: string } }
>(
  "review/addReview",
  async ({ courseId, reviewData }: IAddReviewParams, { rejectWithValue }) => {
    try {
      const response = await reviewService.addReview(courseId, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const fetchCourseReviews = createAsyncThunk<
  IFetchCourseReviewResponse,
  { courseId: string; data: IFetchReviewParams },
  { rejectValue: { message: string } }
>(
  "review/fetchCourseReviews",
  async (
    { courseId, data }: { courseId: string; data: IFetchReviewParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await reviewService.fetchCourseReviews(courseId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const updateReview = createAsyncThunk<
  IReviewAddResponse,
  { courseId: string; reviewId: string; reviewData: IReviewFormData },
  { rejectValue: { message: string } }
>(
  "review/updateReview",
  async ({ courseId, reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewService.updateReview(
        courseId,
        reviewId,
        reviewData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const deleteReview = createAsyncThunk<
  void,
  { courseId: string; reviewId: string },
  { rejectValue: { message: string } }
>(
  "review/deleteReview",
  async ({ courseId, reviewId }, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(courseId, reviewId);
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const fetchAllReviews = createAsyncThunk<
  IFetchAllReviewsResponse,
  IFetchAllReviewsInput,
  { rejectValue: { message: string } }
>(
  "review/fetchAllReviews",
  async (params: IFetchAllReviewsInput, { rejectWithValue }) => {
    try {
      const response = await reviewService.fetchAllReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add Review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not add review";
      })
      // fetching reviews
      .addCase(fetchCourseReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.total = action.payload.total;
      })
      .addCase(fetchCourseReviews.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch course reviews";
      })
      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not update review";
      }) // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not delete review";
      })
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.totalReviews = action.payload.totalReviews;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch reviews";
      });
  },
});

export default reviewSlice.reducer;
