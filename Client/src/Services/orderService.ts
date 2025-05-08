import axios, { AxiosResponse } from "axios";
import { adminApi, userApi } from "../Utils/api";
import {
  ICancelPaymentResponse,
  IConfirmPaymentResponse,
  IFetchKeyResponse,
  IFetchOrderInputs,
  IFetchOrderResponse,
  IOrder,
  IOrderFormData,
  IOrderResponse,
  IPaymentData,
  IUpdateOrderInputs,
  IUpdateOrderStatusResponse,
  IValidateCouponResponse,
  IVerifyPaymentResponse,
} from "../Types/orderTypes";

export const orderService = {
  getPaymentKey: async (): Promise<AxiosResponse<IFetchKeyResponse>> => {
    try {
      const response = await userApi.get("/getKey");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching key"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  createOrder: async (
    data: IOrderFormData
  ): Promise<AxiosResponse<IOrderResponse>> => {
    try {
      const respone = await userApi.post("/create-order", data);
      return respone;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while creating order"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  retryPayment: async (
    orderId: string
  ): Promise<AxiosResponse<IOrderResponse>> => {
    try {
      const response = await userApi.post("/retry-payment", { orderId });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while retrying payment"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  fetchUserOrders: async (
    data: IFetchOrderInputs
  ): Promise<AxiosResponse<IFetchOrderResponse>> => {
    try {
      const response = await userApi.get("/orders", { params: data });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching user orders"
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  updateOrderStatus: async (
    params: IUpdateOrderInputs
  ): Promise<AxiosResponse<IUpdateOrderStatusResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await userApi.put("/update-order-status", params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  confirmPayment: async (
    orderId: string
  ): Promise<AxiosResponse<IConfirmPaymentResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await userApi.post("/confirm-payment", { orderId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  cancelPayment: async (
    orderId: string,
    reason: "payment_cancelled" | "payment_failed"
  ): Promise<AxiosResponse<ICancelPaymentResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await userApi.post("/cancel-payment", {
        orderId,
        reason,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  verifyPayment: async (
    paymentData: IPaymentData
  ): Promise<AxiosResponse<IVerifyPaymentResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await userApi.post("/verify-payment", paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  requestRefund: async (orderId: string): Promise<AxiosResponse<IOrder>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await userApi.put(`/${orderId}/refund`, {});
      return response;
    } catch (error) {
      throw error;
    }
  },

  processRefund: async (
    orderId: string
  ): Promise<AxiosResponse<IUpdateOrderStatusResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await adminApi.put("/process-refund", { orderId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  fetchAllOrders: async (
    page: number,
    limit: number
  ): Promise<AxiosResponse<{ orders: IOrder[]; total: number }>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const respone = await adminApi.get("/orders", {
        params: {
          page,
          limit,
        },
      });
      return respone;
    } catch (error) {
      throw error;
    }
  },

  validateCoupon: async (
    code: string
  ): Promise<AxiosResponse<IValidateCouponResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await userApi.post("/orders/validate-coupon", { code });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
