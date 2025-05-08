import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  ICreateNotificationResponse,
  IDeleteNotificationResponse,
  IFetchBundleResponse,
  IFetchCourseResponse,
  IFetchNotificationInput,
  IFetchNotificationResponse,
  IfetchTargetUsersInput,
  IFetchTargetUsersResponse,
  IFetchUserResponse,
  IMarkupAllNotificationsResponse,
  IMarkupNotificationInput,
  IMarkupNotificationResponse,
  INotificationFormData,
  INotificationState,
  IUnreadNotificationsResponse,
  IUserNotificationsInput,
  IUserNotificationsResponse,
} from "../Types/notificationTypes";
import { notificationService } from "../Services/notificationService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: INotificationState = {
  notifications: [],
  userNotifications: [],
  users: [],
  courses: [],
  bundles: [],
  loading: false,
  error: null,
  page: 1,
  limit: 5,
  total: 0,
  unreadCount: 0,
};

export const fetchAllNotifications = createAsyncThunk<
  IFetchNotificationResponse,
  IFetchNotificationInput,
  { rejectValue: { message: string } }
>(
  "notifications/fetchAllNotifications",
  async (data: IFetchNotificationInput, { rejectWithValue }) => {
    try {
      const response = await notificationService.getAllNotifications(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const fetchUserNotifications = createAsyncThunk<
  IUserNotificationsResponse,
  IUserNotificationsInput,
  { rejectValue: { message: string } }
>(
  "notifications/fetchUserNotifications",
  async (
    { userId, page, limit }: IUserNotificationsInput,
    { rejectWithValue }
  ) => {
    try {
      const response = await notificationService.fetchUserNotifications({
        userId,
        page,
        limit,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const markNotificationRead = createAsyncThunk<
  IMarkupNotificationResponse,
  IMarkupNotificationInput,
  { rejectValue: { message: string } }
>(
  "notifications/markRead",
  async ({ userId, notificationId }, { rejectWithValue }) => {
    try {
      const response = await notificationService.markNotificationAsRead({
        userId,
        notificationId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);
export const markAllNotificationsRead = createAsyncThunk<
  IMarkupAllNotificationsResponse,
  void,
  { rejectValue: { message: string } }
>("notifications/markAllRead", async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.markAllNotificationsAsRead();
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchUnreadCount = createAsyncThunk<
  IUnreadNotificationsResponse,
  void,
  { rejectValue: { message: string } }
>("notifications/fetchUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.getUnreadCount();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});
export const fetchUsers = createAsyncThunk<
  IFetchUserResponse,
  void,
  { rejectValue: { message: string } }
>("notifications/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.fetchUsers();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchCourses = createAsyncThunk<
  IFetchCourseResponse,
  void,
  { rejectValue: { message: string } }
>("notifications/fetchCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.fetchCourses();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchBundles = createAsyncThunk<
  IFetchBundleResponse,
  void,
  { rejectValue: { message: string } }
>("notifications/fetchBundles", async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.fetchBundles();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchTargetUsers = createAsyncThunk<
  IFetchTargetUsersResponse,
  IfetchTargetUsersInput,
  { rejectValue: { message: string } }
>(
  "notifications/fetchTargetUsers",
  async (
    { entityType, entityId }: IfetchTargetUsersInput,
    { rejectWithValue }
  ) => {
    try {
      const response = await notificationService.fetchTargetUsers({
        entityType,
        entityId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const createNotification = createAsyncThunk<
  ICreateNotificationResponse,
  INotificationFormData,
  { rejectValue: { message: string } }
>(
  "notifications/create",
  async (notification: INotificationFormData, { rejectWithValue }) => {
    try {
      const response = await notificationService.createNotification(
        notification
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const deleteNotification = createAsyncThunk<
  IDeleteNotificationResponse,
  string,
  { rejectValue: { message: string } }
>("notifications/delete", async (id: string, { rejectWithValue }) => {
  try {
    const response = await notificationService.deleteNotification(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    resetNotificationState: (state) => {
      state.loading = false;
      state.error = null;
    },
    addNotification: (state, action) => {
      state.userNotifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.userNotifications.find(
        (n) => n._id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.userNotifications.forEach((notification) => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },

    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notifications
      .addCase(fetchAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.total = action.payload.total;
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch all notifications";
      })
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch users";
      })

      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch courses";
      })

      // Fetch bundles
      .addCase(fetchBundles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBundles.fulfilled, (state, action) => {
        state.loading = false;
        state.bundles = action.payload;
      })
      .addCase(fetchBundles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch bundles";
      })

      // Create notification
      .addCase(createNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications?.unshift(action.payload.notification);
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not create notification";
      })

      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        if (state.notifications) {
          state.notifications = state.notifications.filter(
            (notification) => notification._id !== action.payload.notificationId
          );
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not delete notification";
      })
      // Fetch user's notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.userNotifications = action.payload.notifications;

        state.total = action.payload.total;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not fetch user notifications";
      })
      // Mark notification as read
      .addCase(markNotificationRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.userNotifications.find(
          (n) => n._id === action.payload.notificationId
        );
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not mark notification as read";
      }) // Mark all notifications as read
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.loading = false;
        state.userNotifications.forEach((notification) => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Could not mark all notifications as read";
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not fetch unread count";
      });
  },
});

export const {
  resetNotificationState,
  addNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  incrementUnreadCount,
  resetUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
