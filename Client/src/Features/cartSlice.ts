import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  IAddToCartResponse,
  ICartState,
  IFetchCartResponse,
  IRemoveFromCartResponse,
} from "../Types/cartTypes";
import { cartService } from "../Services/cartService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: ICartState = {
  items: [],
  loading: false,
  error: null,
  cartTotal: 0,
};

export const addToCart = createAsyncThunk<
  IAddToCartResponse,
  { itemId: string; itemType: string },
  { rejectValue: { message: string } }
>("/cart/addToCart", async (params, { rejectWithValue }) => {
  try {
    const { itemId, itemType } = params;
    const response = await cartService.addToCart(itemId, itemType);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const removeFromCart = createAsyncThunk<
  IRemoveFromCartResponse,
  { itemId: string; itemType: string },
  { rejectValue: { message: string } }
>("/cart/removeFromCart", async (params, { rejectWithValue }) => {
  try {
    const { itemId, itemType } = params;
    const response = await cartService.removeFromCart(itemId, itemType);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchCart = createAsyncThunk<
  IFetchCartResponse,
  void,
  { rejectValue: { message: string } }
>("/cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.getCart();
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart || state.items;
        state.cartTotal = action.payload.cartTotal || state.cartTotal;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add to cart";
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart || [];
        state.cartTotal = action.payload.cartTotal || 0;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to remove from the cart";
      })
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart || [];
        state.cartTotal = action.payload.cartTotal || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch from the cart";
      });
  },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
