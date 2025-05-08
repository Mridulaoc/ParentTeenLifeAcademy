import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  IAdminLoginCredentials,
  IAdminLoginResponse,
  IFetchUserInputs,
  IFetchUserResponse,
  IAdminState,
  IBlockUserResponse,
} from "../Types/adminTypes";
import { adminService } from "../Services/adminService";
import { IUser } from "../Types/userTypes";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IAdminState = {
  users: [],
  isAuthenticated: !!localStorage.getItem("adminToken"),
  loading: false,
  error: null,
  token: localStorage.getItem("adminToken"),
  total: 0,
  page: 1,
  limit: 5,
  admin: "",
};

// Thunk for admin login

export const adminLogin = createAsyncThunk<
  IAdminLoginResponse,
  IAdminLoginCredentials,
  { rejectValue: { message: string } }
>("admin/adminLogin", async (credentials, { rejectWithValue }) => {
  try {
    const response = await adminService.loginAdmin(credentials);
    if (!response.data.token) {
      return rejectWithValue({ message: "No token received" });
    }
    localStorage.setItem("adminToken", response.data.token);

    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

// Thunk for fetch users

export const fetchAllUsers = createAsyncThunk<
  IFetchUserResponse,
  IFetchUserInputs,
  { rejectValue: { message: string } }
>(
  "admin/fetchUsers",
  async ({ page, limit }: IFetchUserInputs, { rejectWithValue }) => {
    try {
      const response = await adminService.fetchUsers({ page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// Thunk for blocking user

export const blockUser = createAsyncThunk<
  IBlockUserResponse,
  { userId: string },
  { rejectValue: { message: string } }
>("admin/blockUser", async ({ userId }, { rejectWithValue }) => {
  try {
    const response = await adminService.blockUser(userId);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminLogout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem("adminToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.admin = action.payload.adminId;
        localStorage.setItem("adminToken", action.payload.token);
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      })
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        const { id, isBlocked } = action.payload;
        const user = state.users.find((user: IUser) => user._id === id);
        if (user) {
          user.isBlocked = isBlocked;
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to block user";
      });
  },
});

export const { adminLogout } = adminSlice.actions;
export default adminSlice.reducer;
