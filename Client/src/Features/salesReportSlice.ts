import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminApi } from "../Utils/api";
import { handleAsyncThunkError } from "../Utils/errorHandling";

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

interface MonthlySales {
  period: string;
  orders: number;
  revenue: number;
}

interface SalesReportData {
  summary: SalesSummary;
  monthlyData: MonthlySales[];
}

interface SalesReportState {
  data: SalesReportData | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalesReportState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchSalesReport = createAsyncThunk(
  "salesReport/fetchSalesReport",
  async (
    { startDate, endDate }: { startDate: Date; endDate: Date },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.get("/sales-report", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data as SalesReportData;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

const salesReportSlice = createSlice({
  name: "salesReport",
  initialState,
  reducers: {
    clearSalesReport: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSalesReport } = salesReportSlice.actions;
export default salesReportSlice.reducer;
