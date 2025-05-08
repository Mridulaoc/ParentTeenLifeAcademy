import { adminApi } from "../Utils/api";
import {
  IAdminLoginCredentials,
  IAdminLoginResponse,
  IBlockUserResponse,
  IFetchUserInputs,
  IFetchUserResponse,
} from "../Types/adminTypes";
import { AxiosResponse } from "axios";

export const adminService = {
  loginAdmin: (
    loginData: IAdminLoginCredentials
  ): Promise<AxiosResponse<IAdminLoginResponse>> => {
    return adminApi.post("/", loginData);
  },

  fetchUsers: (
    data: IFetchUserInputs
  ): Promise<AxiosResponse<IFetchUserResponse>> => {
    return adminApi.get("/users", { params: data });
  },

  blockUser: (userId: string): Promise<AxiosResponse<IBlockUserResponse>> => {
    return adminApi.patch(`/users/${userId}`);
  },
};
