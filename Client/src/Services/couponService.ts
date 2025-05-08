import { AxiosResponse } from "axios";
import {
  ICoupon,
  ICouponDeactivateInput,
  ICouponDeactivateResponse,
  ICreateCouponInput,
  ICreateCouponResponse,
  IFetchCouponInputs,
  IFetchCouponResponse,
  IUpdateCouponResponse,
} from "../Types/couponTypes";
import { adminApi } from "../Utils/api";

export const couponService = {
  createCoupon: async (
    data: ICreateCouponInput
  ): Promise<AxiosResponse<ICreateCouponResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await adminApi.post("/coupon", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  fetchCoupons: async (
    data: IFetchCouponInputs
  ): Promise<AxiosResponse<IFetchCouponResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await adminApi.get("/coupon", { params: data });
      return response;
    } catch (error) {
      throw error;
    }
  },

  fetchCouponById: async (id: string): Promise<AxiosResponse<ICoupon>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await adminApi.get(`/coupons/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateCoupon: async (
    id: string,
    data: ICreateCouponInput
  ): Promise<AxiosResponse<IUpdateCouponResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await adminApi.put(`/coupons/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteCoupon: async (
    data: ICouponDeactivateInput
  ): Promise<AxiosResponse<ICouponDeactivateResponse>> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await adminApi.patch(`/coupons/${data.id}`, {
        isActive: data.isActive,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
