import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  IClassDataInputs,
  IClassInitialState,
  IClassScheduleResponse,
  ILiveClassDetails,
} from "../Types/classTypes";
import { classService } from "../Services/classService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IClassInitialState = {
  currentClass: null,
  loading: true,
  error: null,
};

export const scheduleClass = createAsyncThunk<
  IClassScheduleResponse,
  IClassDataInputs,
  { rejectValue: { message: string } }
>("class/scheduleClass", async (classData, { rejectWithValue }) => {
  try {
    const response = await classService.scheduleClass(classData);

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchClass = createAsyncThunk<
  ILiveClassDetails,
  void,
  { rejectValue: { message: string } }
>("/class/fetchClass", async (_, { rejectWithValue }) => {
  try {
    const response = await classService.fetchClass();
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const classSlice = createSlice({
  name: "class",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(scheduleClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scheduleClass.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(scheduleClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not schedule class";
      })
      .addCase(fetchClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClass.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClass = action.payload;
      })
      .addCase(fetchClass.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload?.message || "Could not fetch class";
      });
  },
});

export default classSlice.reducer;
