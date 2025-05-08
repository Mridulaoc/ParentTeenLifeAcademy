import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { wishlistService } from "../Services/wishlistService";
import {
  IAddToWishlistResponse,
  IFetchWishlistResponse,
  IRemoveFromWishlistResponse,
  IWishlistActionParams,
  IWishlistState,
} from "../Types/wishListTypes";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IWishlistState = {
  items: [],
  loading: false,
  error: null,
};

// thunk for adding to wishlist
export const addToWishlist = createAsyncThunk<
  IAddToWishlistResponse,
  IWishlistActionParams,
  { rejectValue: { message: string } }
>(
  "/wishlist/addToWishlist",
  async ({ itemId, itemType }, { rejectWithValue }) => {
    try {
      const response = await wishlistService.addToWishlist(itemId, itemType);

      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for removing from wishlist

export const removeFromWishlist = createAsyncThunk<
  IRemoveFromWishlistResponse,
  string,
  { rejectValue: { message: string } }
>(
  "/wishlist/removeFromWishlist",
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await wishlistService.removeFromWishlist(itemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

// thunk for fetching wishlist
export const fetchWishlist = createAsyncThunk<
  IFetchWishlistResponse,
  void,
  { rejectValue: { message: string } }
>("/wishlist/fetchWishlist", async (_, { rejectWithValue }) => {
  try {
    const response = await wishlistService.getWishlist();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // adding course to wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not add to wishlist";
      })
      // removing course from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist || [];
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not remove from wishlist";
      })
      // fetching wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.wishlist) {
          state.items = action.payload.wishlist;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch wishlist";
      });
  },
});

export default wishlistSlice.reducer;
