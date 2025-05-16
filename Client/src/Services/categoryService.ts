import { AxiosResponse } from "axios";
import {
  ICategoryResponse,
  ICategoryFormData,
  ICategory,
  ICategoryInput,
} from "../Types/categoryTypes";
import { adminApi, userApi } from "../Utils/api";

export const categoryService = {
  fetchAll: (
    input: ICategoryInput
  ): Promise<AxiosResponse<ICategoryResponse>> => {
    const api = input.admin ? adminApi : userApi;
    console.log("Api:", api);
    return api.get("/categories");
  },

  addCategory: (
    submissionData: ICategoryFormData
  ): Promise<AxiosResponse<{ message: string; category: ICategory }>> => {
    return adminApi.post("/categories", submissionData);
  },

  fetchACategory: (id: string): Promise<AxiosResponse<ICategory>> => {
    return adminApi.get(`/categories/${id}`);
  },

  updateCategory: (
    id: string,
    name: string,
    description: string
  ): Promise<AxiosResponse<{ message: string; category: ICategory }>> => {
    return adminApi.patch(`/categories/${id}`, { name, description });
  },

  deleteCategory: (
    id: string,
    isDeleted: boolean
  ): Promise<AxiosResponse<{ category: ICategory; message: string }>> => {
    return adminApi.delete(`/categories/${id}`, {
      data: { isDeleted: isDeleted },
    });
  },
};
