import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IDashboardState } from "../Types/dashboardTypes";
import { dashboardService } from "../Services/dashboardService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IDashboardState = {
  stats: {
    totalStudents: 0,
    totalCourses: 0,
    totalBundles: 0,
    totalReviews: 0,
    totalUsers: 0,
    totalRevenue: 0,
  },

  salesData: [],
  revenueData: [],
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "/dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.fetchDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = {
          totalStudents: action.payload.totalStudents,
          totalCourses: action.payload.totalCourses,
          totalReviews: action.payload.totalReviews,
          totalRevenue: action.payload.totalRevenue,
          totalBundles: action.payload.totalBundles,
          totalUsers: action.payload.totalUsers,
        };

        state.salesData = action.payload.monthlySalesData || [];
        state.revenueData = action.payload.monthlyRevenueData || [];
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export default dashboardSlice.reducer;
