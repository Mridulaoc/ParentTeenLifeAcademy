import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { categoryService } from "../Services/categoryService";
import {
  ICategoryResponse,
  ICategory,
  ICategoryFormData,
  ICategoryState,
} from "../Types/categoryTypes";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: ICategoryState = {
  categories: [],
  loading: false,
  error: null,
  token: localStorage.getItem("adminToken"),
  isAuthenticated: !!localStorage.getItem("adminToken"),
  addCategorySuccess: false,
  category: {
    _id: "",
    name: "",
    description: "",
    isDeleted: false,
  },
};

export const fetchCategories = createAsyncThunk<
  ICategoryResponse,
  void,
  { rejectValue: { message: string } }
>("category/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await categoryService.fetchAll();
    if (!response.data.categories || response.data.categories.length === 0) {
      return rejectWithValue({ message: "No categories found" });
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const addCategory = createAsyncThunk<
  { message: string; category: ICategory },
  ICategoryFormData,
  { rejectValue: { message: string } }
>(
  "category/addCategory",
  async (submissionData: ICategoryFormData, { rejectWithValue }) => {
    try {
      const response = await categoryService.addCategory(submissionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const fetchCategoryById = createAsyncThunk<
  ICategory,
  string,
  { rejectValue: { message: string } }
>("category/fetchCategoryById", async (id, { rejectWithValue }) => {
  try {
    const response = await categoryService.fetchACategory(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const updateCategory = createAsyncThunk<
  { message: string; category: ICategory },
  { id: string; name: string; description: string },
  { rejectValue: { message: string } }
>(
  "category/updateCategory",
  async ({ id, name, description }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(
        id,
        name,
        description
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const deleteCategory = createAsyncThunk<
  {
    category: ICategory;
    message: string;
  },
  { id: string; isDeleted: boolean },
  { rejectValue: { message: string } }
>("category/deleteCategory", async ({ id, isDeleted }, { rejectWithValue }) => {
  try {
    const response = await categoryService.deleteCategory(id, isDeleted);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    resetAddCategorySuccess: (state) => {
      state.addCategorySuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.categories = [];
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to fetch categories";
      })
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.addCategorySuccess = false;
      })
      .addCase(addCategory.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.addCategorySuccess = true;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to add category";
        state.addCategorySuccess = false;
      })
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch category";
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update category";
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload && action.payload.category) {
          const updatedCategory = action.payload.category;
          state.categories = state.categories.map((category) =>
            category._id === updatedCategory._id ? updatedCategory : category
          );
        }
      });
  },
});
export const { resetAddCategorySuccess } = categorySlice.actions;
export default categorySlice.reducer;
