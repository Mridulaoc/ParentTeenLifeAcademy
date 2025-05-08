import { IUser } from "../Types/userTypes";

export interface IAdminLoginCredentials {
  email: string;
  password: string;
}
export interface IAdminLoginResponse {
  message: string;
  adminId: string;
  token: string;
}
export interface IFetchUserInputs {
  page: number;
  limit: number;
}

export interface IFetchUserResponse {
  users: IUser[];
  total: number;
  page: number;
  limit: number;
}

export interface IAdmin {
  _id: string;
  email: string;
}

export interface IAdminState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
  users: IUser[];
  total: number;
  page: number;
  limit: number;
  admin: string;
}

export interface IBlockUserResponse {
  message: string;
  id: string;
  isBlocked: boolean;
}
