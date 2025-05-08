import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ICoupon,
  ICouponDeactivateInput,
  ICouponDeactivateResponse,
  ICouponState,
  ICreateCouponInput,
  ICreateCouponResponse,
  IFetchCouponInputs,
  IFetchCouponResponse,
  IUpdateCouponInput,
  IUpdateCouponResponse,
} from "../Types/couponTypes";
import { couponService } from "../Services/couponService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: ICouponState = {
  coupons: [],
  coupon: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 5,
};

export const createCoupon = createAsyncThunk<
  ICreateCouponResponse,
  ICreateCouponInput,
  { rejectValue: { message: string } }
>(
  "/coupon/createCoupon",
  async (data: ICreateCouponInput, { rejectWithValue }) => {
    try {
      const response = await couponService.createCoupon(data);

      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const fetchCoupons = createAsyncThunk<
  IFetchCouponResponse,
  IFetchCouponInputs,
  { rejectValue: { message: string } }
>(
  "/coupon/fetchCoupons",
  async (params: IFetchCouponInputs, { rejectWithValue }) => {
    try {
      const response = await couponService.fetchCoupons(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const fetchCouponById = createAsyncThunk<
  ICoupon,
  string,
  { rejectValue: { message: string } }
>("/coupon/fetchCouponById", async (id: string, { rejectWithValue }) => {
  try {
    const response = await couponService.fetchCouponById(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const updateCoupon = createAsyncThunk<
  IUpdateCouponResponse,
  IUpdateCouponInput,
  { rejectValue: { message: string } }
>(
  "/coupon/updateCoupon",
  async ({ id, couponData }: IUpdateCouponInput, { rejectWithValue }) => {
    try {
      const response = await couponService.updateCoupon(id, couponData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const deactivateCoupon = createAsyncThunk<
  ICouponDeactivateResponse,
  ICouponDeactivateInput,
  { rejectValue: { message: string } }
>(
  "/coupon/deactivateCoupon",
  async (data: ICouponDeactivateInput, { rejectWithValue }) => {
    try {
      const response = await couponService.deleteCoupon(data);

      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to create coupon";
      })
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch coupons";
      })
      .addCase(fetchCouponById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCouponById.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload;
      })
      .addCase(fetchCouponById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch coupon";
      })
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload.coupon;
        state.coupons = state.coupons.map((c) =>
          c._id === action.payload.coupon._id ? action.payload.coupon : c
        );
      })

      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not update coupon";
      })
      .addCase(deactivateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateCoupon.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload && action.payload.coupon) {
          state.coupons = state.coupons.map((c) =>
            c._id === action.payload.coupon._id ? action.payload.coupon : c
          );
        }
      })
      .addCase(deactivateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not deactivate coupon";
      });
  },
});

export default couponSlice.reducer;
