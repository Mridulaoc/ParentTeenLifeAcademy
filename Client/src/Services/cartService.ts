import axios, { AxiosResponse } from "axios";
import {
  IAddToCartResponse,
  IFetchCartResponse,
  IRemoveFromCartResponse,
} from "../Types/cartTypes";
import { userApi } from "../Utils/api";

export const cartService = {
  addToCart: async (
    id: string,
    itemType: string
  ): Promise<AxiosResponse<IAddToCartResponse>> => {
    try {
      const response = await userApi.post("/cart", { id, itemType });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while adding to the cart."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
  removeFromCart: async (
    itemId: string,
    itemType: string
  ): Promise<AxiosResponse<IRemoveFromCartResponse>> => {
    try {
      const response = await userApi.delete(
        `/cart/${itemId}?itemType=${itemType}`
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while removing from the  cart."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },

  getCart: async (): Promise<AxiosResponse<IFetchCartResponse>> => {
    try {
      const response = await userApi.get("/cart");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw (
          error.response?.data?.message ||
          "An error occurred while fetching the cart."
        );
      }
      throw new Error("An unknown error occurred");
    }
  },
};
