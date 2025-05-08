import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICourse } from "../Types/courseTypes";
import { courseBundleService } from "../Services/courseBundleSevices";
import {
  IBundleState,
  IBundleUpdateData,
  ICourseBundle,
  ICreateBundleFormData,
  ICreateBundleResponse,
  IFetchBundleInputs,
  IFetchBundleResponse,
} from "../Types/courseBundleTypes";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IBundleState = {
  courses: [],
  bundles: [],
  loading: false,
  error: null,
  currentBundle: null,
  total: 0,
  page: 1,
  limit: 5,
  search: "",
  category: "",
  sort: "",
};

// thunk for fetching all courses
export const fetchAllCourses = createAsyncThunk<
  ICourse[],
  void,
  { rejectValue: string }
>("courseBundle/fetchAllCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await courseBundleService.fetchAllCourses();
    return response.data;
  } catch (error) {
    if (typeof error === "string") {
      return rejectWithValue(error);
    }
    return rejectWithValue("Failed to fetch courses");
  }
});

// thunk for creating bundle

export const createBundle = createAsyncThunk<
  ICreateBundleResponse,
  ICreateBundleFormData,
  { rejectValue: { message: string } }
>(
  "courseBundle/createBundle",
  async (data: ICreateBundleFormData, { rejectWithValue }) => {
    try {
      const response = await courseBundleService.createBundle(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for fetching all bundles

export const fetchAllBundles = createAsyncThunk<
  IFetchBundleResponse,
  IFetchBundleInputs,
  { rejectValue: { message: string } }
>(
  "courseBundle/fetchAllBundles",
  async (
    { page, limit, search, category, sort }: IFetchBundleInputs,
    { rejectWithValue }
  ) => {
    try {
      const response = await courseBundleService.fetchAllBundles({
        page,
        limit,
        search,
        category,
        sort,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const deleteBundle = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: { message: string } }
>(
  "courseBundle/deleteBundle",
  async (bundleId: string, { rejectWithValue }) => {
    try {
      const response = await courseBundleService.deleteBundle(bundleId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for fetching bundle details

export const fetchBundleDetails = createAsyncThunk<
  ICourseBundle,
  string,
  { rejectValue: { message: string } }
>(
  "/courseBundle/fetchBundleDetails",
  async (bundleId: string, { rejectWithValue }) => {
    try {
      const response = await courseBundleService.fetchBundleDetails(bundleId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for updating the bundle
export const updateBundle = createAsyncThunk<
  { message: string },
  { bundleId: string; bundleData: IBundleUpdateData },
  { rejectValue: { message: string } }
>(
  "/courseBundle/updateBundle",
  async ({ bundleId, bundleData }, { rejectWithValue }) => {
    try {
      const response = await courseBundleService.updateBundle(
        bundleData,
        bundleId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

const courseBundleSlice = createSlice({
  name: "bundle",
  initialState,
  reducers: {
    addCourseToBundle: (state, action) => {
      if (!state.currentBundle) {
        state.currentBundle = {
          title: "",
          description: "",
          courses: [],
          totalPrice: 0,
          discountedPrice: 0,
          featuredImage: "",
        };
      }
      const exists = state.currentBundle.courses?.some(
        (course) => course._id === action.payload._id
      );
      if (!exists) {
        state.currentBundle.courses?.push(action.payload);
        state.currentBundle.totalPrice += action.payload.price;
      }
    },
    removeCourseFromBundle: (state, action) => {
      if (Array.isArray(state.currentBundle?.courses)) {
        const courseToRemove = state.currentBundle.courses.find(
          (course) => course._id === action.payload
        );
        state.currentBundle.courses = state.currentBundle.courses.filter(
          (course) => course._id !== action.payload
        );
        if (courseToRemove && state.currentBundle.totalPrice) {
          state.currentBundle.totalPrice -= courseToRemove.price;
        }
      }
    },

    resetBundleCourses: (state) => {
      state.currentBundle = {
        title: "",
        description: "",
        featuredImage: "",
        courses: [],
        totalPrice: 0,
        discountedPrice: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetch create bundle
      .addCase(createBundle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBundle.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createBundle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not create bundle";
      })
      // fetch bundles
      .addCase(fetchAllBundles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBundles.fulfilled, (state, action) => {
        state.loading = false;
        state.bundles = action.payload.bundles;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.search = action.meta.arg.search || "";
        state.category = action.meta.arg.category || "";
        state.sort = action.meta.arg.sort || "";
      })
      .addCase(fetchAllBundles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch bundle";
      })
      // fetch delete a bundle
      .addCase(deleteBundle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBundle.fulfilled, (state, action) => {
        state.loading = false;
        state.bundles = state.bundles.filter(
          (bundle) => bundle._id !== action.meta.arg
        );
      })
      .addCase(deleteBundle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not delete bundle";
      })

      // fetch bundle details
      .addCase(fetchBundleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBundleDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBundle = action.payload;
      })
      .addCase(fetchBundleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch bundle details";
      });
  },
});

export const { addCourseToBundle, removeCourseFromBundle, resetBundleCourses } =
  courseBundleSlice.actions;
export default courseBundleSlice.reducer;
