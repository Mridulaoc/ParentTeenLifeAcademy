import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ICancelPaymentInput,
  ICancelPaymentResponse,
  IFetchKeyResponse,
  IFetchOrderInputs,
  IFetchOrderResponse,
  IOrder,
  IOrderFormData,
  IOrderResponse,
  IPaymentData,
  IPaymentState,
  IUpdateOrderInputs,
  IUpdateOrderStatusResponse,
  IValidateCouponResponse,
  IVerifyPaymentResponse,
} from "../Types/orderTypes";
import { orderService } from "../Services/orderService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IPaymentState = {
  key: "",
  orderId: null,
  orderAmount: 0,
  loading: false,
  error: null,
  paymentSuccessful: false,
  paymentResponse: null,
  orders: [],
  total: 0,
  page: 0,
  limit: 0,
  currentOrder: null,
  orderStatus: null,
  coupon: null,
  couponLoading: false,
  couponError: null,
};

export const fetchPaymentKey = createAsyncThunk<
  IFetchKeyResponse,
  void,
  { rejectValue: { message: string } }
>("/order/fetchPaymentKey", async (_, { rejectWithValue }) => {
  try {
    const response = await orderService.getPaymentKey();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const createPaymentOrder = createAsyncThunk<
  IOrderResponse,
  IOrderFormData,
  { rejectValue: { message: string } }
>("/order/createOrder", async (data, { rejectWithValue }) => {
  try {
    const response = await orderService.createOrder(data);

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchUserOrders = createAsyncThunk<
  IFetchOrderResponse,
  IFetchOrderInputs,
  { rejectValue: { message: string } }
>(
  "order/fetchUserOrders",
  async ({ page, limit }: IFetchOrderInputs, { rejectWithValue }) => {
    try {
      const response = await orderService.fetchUserOrders({ page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const retryPayment = createAsyncThunk<
  IOrderResponse,
  string,
  { rejectValue: { message: string } }
>("/order/retryPayment", async (orderId: string, { rejectWithValue }) => {
  try {
    const response = await orderService.retryPayment(orderId);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const updateOrderStatus = createAsyncThunk<
  IUpdateOrderStatusResponse,
  IUpdateOrderInputs,
  { rejectValue: { message: string } }
>(
  "order/updateStatus",
  async (params: IUpdateOrderInputs, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const verifyPayment = createAsyncThunk<
  IVerifyPaymentResponse,
  IPaymentData,
  { rejectValue: { message: string } }
>(
  "order/verifyPayment",
  async (paymentData: IPaymentData, { rejectWithValue, dispatch }) => {
    try {
      const response = await orderService.verifyPayment(paymentData);
      dispatch(removeCoupon());
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const cancelPayment = createAsyncThunk<
  ICancelPaymentResponse,
  ICancelPaymentInput,
  { rejectValue: { message: string } }
>("order/cancelPayment", async ({ orderId, reason }, { rejectWithValue }) => {
  try {
    const response = await orderService.cancelPayment(orderId, reason);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const failPayment = createAsyncThunk<
  ICancelPaymentResponse,
  string,
  { rejectValue: { message: string } }
>("order/failPayment", async (orderId: string, { rejectWithValue }) => {
  try {
    const response = await orderService.cancelPayment(
      orderId,
      "payment_failed"
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const requestRefund = createAsyncThunk<
  IOrder,
  string,
  { rejectValue: { message: string } }
>("order/requestRefund", async (orderId: string, { rejectWithValue }) => {
  try {
    const response = await orderService.requestRefund(orderId);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const processRefund = createAsyncThunk<
  IUpdateOrderStatusResponse,
  string,
  { rejectValue: { message: string } }
>("order/processRefund", async (orderId: string, { rejectWithValue }) => {
  try {
    const response = await orderService.processRefund(orderId);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchAllOrders = createAsyncThunk<
  { orders: IOrder[]; total: number },
  { page: number; limit: number },
  { rejectValue: { message: string } }
>(
  "order/fetchAllOrders",
  async (
    { page, limit }: { page: number; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.fetchAllOrders(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const validateCoupon = createAsyncThunk<
  IValidateCouponResponse,
  string,
  { rejectValue: { message: string } }
>("order/validateCoupon", async (code: string, { rejectWithValue }) => {
  try {
    const response = await orderService.validateCoupon(code);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderState: (state) => {
      state.orderId = null;
      state.error = null;
    },
    resetPaymentStatus: (state) => {
      state.paymentSuccessful = false;
      state.paymentResponse = null;
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.couponError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentKey.fulfilled, (state, action) => {
        state.loading = false;
        state.key = action.payload.key;
      })
      .addCase(fetchPaymentKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch payment key";
      })
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderId = action.payload.orderId;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not create paymnet order";
      })

      .addCase(cancelPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(cancelPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not cancel the payment";
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;

        if (state.orders) {
          state.orders = state.orders.map((order) =>
            order.orderId === action.payload.order.orderId
              ? action.payload.order
              : order
          );
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update order status";
      })

      .addCase(retryPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.orderId = action.payload.orderId;
        state.orderAmount = action.payload.amount || 0;
      })
      .addCase(retryPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not retry payment";
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch user orders";
      })
      .addCase(requestRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestRefund.fulfilled, (state, action) => {
        state.loading = false;
        if (state.orders.length > 0) {
          const orderIndex = state.orders.findIndex(
            (order) => order.orderId === action.meta.arg
          );
          if (orderIndex !== -1) {
            state.orders[orderIndex].status = "Refund Requested";
          }
        }
      })
      .addCase(requestRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to request refund";
      })
      .addCase(processRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading = false;
        if (state.orders) {
          state.orders = state.orders.map((order) =>
            order.orderId === action.payload.order.orderId
              ? action.payload.order
              : order
          );
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to process refund";
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch all orders";
      })
      .addCase(validateCoupon.pending, (state) => {
        state.couponLoading = true;
        state.couponError = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.couponLoading = false;
        state.coupon = action.payload.coupon;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.couponLoading = false;
        state.couponError = action.payload?.message || "Invalid coupon code";
      });
  },
});
export const { clearOrderState, resetPaymentStatus, removeCoupon } =
  orderSlice.actions;
export default orderSlice.reducer;
