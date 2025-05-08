import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  IChat,
  IChatState,
  IGetAdminIdResponse,
  IGetChatByIdInputs,
} from "../Types/chatTypes";
import { chatService } from "../Services/chatService";
import { handleAsyncThunkError } from "../Utils/errorHandling";

const initialState: IChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
  success: false,
  messages: [],
  unreadCount: 0,
  isTyping: false,
  typingUser: null,
  adminId: "",
  userStatuses: {},
};

export const fetchAdminChats = createAsyncThunk<
  IChat[],
  void,
  { rejectValue: { message: string } }
>("chat/fetchAdminChats", async (_, { rejectWithValue }) => {
  try {
    const response = await chatService.getAdminChats();
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchStudentChats = createAsyncThunk<
  IChat[],
  void,
  { rejectValue: { message: string } }
>("chat/fetchStudentChats", async (_, { rejectWithValue }) => {
  try {
    const response = await chatService.getStudentChats();

    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const getOrCreateChat = createAsyncThunk<
  IChat,
  string,
  { rejectValue: { message: string } }
>("chat/createOrGetChat", async (adminId: string, { rejectWithValue }) => {
  try {
    const response = await chatService.getOrCreateChat(adminId);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const createAdminChat = createAsyncThunk<
  IChat,
  string,
  { rejectValue: { message: string } }
>("/chat/createAdminChat", async (studentId: string, { rejectWithValue }) => {
  try {
    const response = await chatService.createAdminChat(studentId);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

export const fetchChatById = createAsyncThunk<
  IChat,
  IGetChatByIdInputs,
  { rejectValue: { message: string } }
>(
  "chat/fetchChatById",
  async ({ chatId, role }: IGetChatByIdInputs, { rejectWithValue }) => {
    try {
      const response = await chatService.getChatById(chatId, role);

      return response.data;
    } catch (error) {
      return rejectWithValue(handleAsyncThunkError(error));
    }
  }
);

export const fetchAdminId = createAsyncThunk<
  IGetAdminIdResponse,
  void,
  { rejectValue: { message: string } }
>("/chat/fetchAdminId", async (_, { rejectWithValue }) => {
  try {
    const response = await chatService.getAdminId();
    return response.data;
  } catch (error) {
    return rejectWithValue(handleAsyncThunkError(error));
  }
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setUserStatus(state, action) {
      const { userId, status } = action.payload;
      state.userStatuses = {
        ...state.userStatuses,
        [userId]: status,
      };
    },

    setCurrentChat(state, action) {
      state.currentChat = action.payload;
      if (action.payload) {
        state.messages = action.payload.messages;
      } else {
        state.messages = [];
      }
    },

    addNewChat(state, action) {
      const existingChatIndex = state.chats.findIndex(
        (chat) => chat._id === action.payload._id
      );
      if (existingChatIndex === -1) {
        state.chats.unshift(action.payload);
        state.chats[0].unreadCount = 1;
        state.unreadCount += 1;
      }
    },

    addMessage(state, action) {
      const { chatId, message } = action.payload;

      const serializedMessage = {
        ...message,
        timestamp:
          message.timestamp instanceof Date
            ? message.timestamp.toISOString()
            : message.timestamp,
      };

      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        if (!state.chats[chatIndex].messages) {
          state.chats[chatIndex].messages = [];
        }

        const messageExists = state.chats[chatIndex].messages.some(
          (msg) =>
            (msg._id && msg._id === serializedMessage._id) ||
            (msg.content === serializedMessage.content &&
              msg.sender === serializedMessage.sender &&
              msg.timestamp === serializedMessage.timestamp)
        );

        if (!messageExists) {
          state.chats[chatIndex].messages.push(serializedMessage);
          state.chats[chatIndex].lastUpdated = new Date().toISOString();

          if (chatIndex > 0) {
            const chat = state.chats[chatIndex];
            state.chats.splice(chatIndex, 1);
            state.chats.unshift(chat);
          }
        }
      }
      if (state.currentChat && state.currentChat._id === chatId) {
        const messageExists = state.messages.some(
          (msg) =>
            (msg._id && msg._id === serializedMessage._id) ||
            (msg.content === serializedMessage.content &&
              msg.sender === serializedMessage.sender &&
              msg.timestamp === serializedMessage.timestamp)
        );

        if (!messageExists) {
          state.messages.push(serializedMessage);

          if (state.currentChat.messages) {
            state.currentChat.messages.push(serializedMessage);
          } else {
            state.currentChat.messages = [serializedMessage];
          }
        }
      }
    },

    incrementUnreadCount: (state, action) => {
      if (
        state.currentChat &&
        state.currentChat._id === action.payload.chatId
      ) {
        return;
      }

      state.unreadCount += 1;
      const chatIndex = state.chats.findIndex(
        (chat) => chat._id === action.payload.chatId
      );
      if (chatIndex !== -1) {
        if (!state.chats[chatIndex].unreadCount) {
          state.chats[chatIndex].unreadCount = 0;
        }
        state.chats[chatIndex].unreadCount += 1;
      }
    },
    resetUnreadCount(state, action) {
      if (action.payload) {
        const chatIndex = state.chats.findIndex(
          (chat) => chat._id === action.payload
        );
        if (chatIndex !== -1) {
          const chatUnreadCount = state.chats[chatIndex].unreadCount || 0;
          state.unreadCount -= chatUnreadCount;

          state.chats[chatIndex].unreadCount = 0;
        }
      } else {
        state.unreadCount = 0;
        state.chats.forEach((chat) => {
          chat.unreadCount = 0;
        });
      }
    },
    setTypingStatus(state, action) {
      const { isTyping, userId, userType } = action.payload;
      state.isTyping = isTyping;
      state.typingUser = isTyping ? { id: userId, type: userType } : null;
    },
    markMessagesAsRead(state, action) {
      const { messageIds, chatId } = action.payload;

      if (state.currentChat && state.currentChat._id === chatId) {
        if (state.currentChat.messages) {
          state.currentChat.messages.forEach((msg) => {
            if (messageIds.includes(msg._id)) {
              msg.read = true;
            }
          });
        }
      }
      state.messages.forEach((message) => {
        if (messageIds.includes(message._id)) {
          message.read = true;
        }
      });

      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].messages?.forEach((msg) => {
          if (messageIds.includes(msg._id)) {
            msg.read = true;
          }
        });
      }
    },

    moveToTop(state, action) {
      const chatId = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex > 0) {
        const chat = state.chats[chatIndex];
        state.chats.splice(chatIndex, 1);
        state.chats.unshift(chat);
      }
    },

    clearChatState(state) {
      state.currentChat = null;
      state.messages = [];
      state.isTyping = false;
      state.typingUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminChats
      .addCase(fetchAdminChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
        state.success = true;
      })
      .addCase(fetchAdminChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch admin chats";
      })

      // fetchStudentChats
      .addCase(fetchStudentChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
        let totalUnread = 0;
        action.payload.forEach((chat) => {
          totalUnread += chat.unreadCount || 0;
        });
        state.unreadCount = totalUnread;
      })
      .addCase(fetchStudentChats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch student chats";
      })

      // fetchChatById
      .addCase(fetchChatById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
        state.messages = action.payload.messages;
        state.success = true;
        if (action.payload.messages && action.payload.messages.length > 0) {
          const role = action.meta.arg.role;
          const unreadMessages = action.payload.messages.filter(
            (msg) =>
              ((role === "student" && msg.sender === "admin") ||
                (role === "student" && msg.sender === "admin")) &&
              !msg.read
          );
          if (unreadMessages.length > 0) {
            state.currentChat.unreadCount = unreadMessages.length;
            const chatIndex = state.chats.findIndex(
              (chat) => chat._id === action.payload._id
            );
            if (chatIndex !== 1) {
              state.chats[chatIndex].unreadCount = unreadMessages.length;
            }
          }
        }
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch chat";
      })

      // createOrGetChat
      .addCase(getOrCreateChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;

        // Add to chats list if not already there
        if (!state.chats.find((chat) => chat._id === action.payload._id)) {
          state.chats.unshift(action.payload);
        }

        state.success = true;
      })
      .addCase(getOrCreateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create chat";
      })

      // create admin chat
      .addCase(createAdminChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminChat.fulfilled, (state, action) => {
        const existingChat = state.chats.find(
          (chat) => chat._id === action.payload._id
        );
        if (!existingChat) {
          state.chats.unshift(action.payload);
        }
        state.currentChat = action.payload;
      })
      .addCase(createAdminChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create chat";
      })
      .addCase(fetchAdminId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminId.fulfilled, (state, action) => {
        state.adminId = action.payload.adminId;
        state.loading = false;
      })
      .addCase(fetchAdminId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch admin id";
      });
  },
});

export const {
  setCurrentChat,
  addMessage,
  clearChatState,
  resetUnreadCount,
  incrementUnreadCount,
  setTypingStatus,
  markMessagesAsRead,
  addNewChat,
  moveToTop,
  setUserStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
