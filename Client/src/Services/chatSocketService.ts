import { io, Socket } from "socket.io-client";
import {
  addMessage,
  addNewChat,
  incrementUnreadCount,
  markMessagesAsRead,
  moveToTop,
  setTypingStatus,
  setUserStatus,
} from "../Features/chatSlice";
import store from "../Store/store";

export interface IUserProfile {
  id: string;
  name: string;
  role: string;
}

let chatSocket: Socket | null = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const activeChats = new Set();
const SOCKET_TYPE = "chat";

export const initializeChatSocket = (
  userId: string,
  token: string,
  isAdmin = false
) => {
  if (!userId || !token) {
    console.error("Chat socket initialization failed: Missing userId or token");
    return null;
  }

  if (chatSocket && chatSocket.connected) {
    return chatSocket;
  }

  if (chatSocket) {
    chatSocket.removeAllListeners();
    chatSocket.disconnect();
    chatSocket = null;
  }

  connectionAttempts = 0;
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  chatSocket = io(`${API_BASE_URL}/chat`, {
    path: "/socket.io/",
    transports: ["websocket"],
    auth: {
      token,
      userId,
      socketType: SOCKET_TYPE,
      userType: isAdmin ? "admin" : "student",
    },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  });
  chatSocket.on("connect", () => {
    console.log("Connected!");
  });

  chatSocket.on("connect_error", (error) => {
    console.error("Connection error:", error);
  });
  setupSocketListeners(chatSocket, isAdmin, userId);
  return chatSocket;
};

const setupSocketListeners = (
  socket: Socket,
  isAdmin: boolean,
  userId: string
) => {
  socket.removeAllListeners();

  // Handle joining chat

  socket.on("connect", () => {
    connectionAttempts = 0;

    activeChats.forEach((chatId) => {
      socket.emit("join-chat", chatId);
    });
  });

  // Setting user status
  socket.on("user_status_change", (statusData) => {
    store.dispatch(
      setUserStatus({
        userId: statusData.userId,
        status: statusData.status,
        chatId: statusData.chatId,
      })
    );
  });

  // chat creation notification

  socket.on("new_chat_created", (chatData) => {
    if (isAdmin) {
      store.dispatch(addNewChat(chatData));
    }
  });

  // Handle receive messages

  socket.on("receive_message", (messageData) => {
    if (
      (messageData.senderId && messageData.senderId === userId) ||
      (messageData.sender === "student" && !isAdmin) ||
      (messageData.sender === "admin" && isAdmin)
    ) {
      return;
    }
    const messageChat = messageData.chatId;
    if (!messageChat) {
      return;
    }

    store.dispatch(
      addMessage({
        chatId: messageChat,
        message: messageData,
      })
    );

    const currentChat = store.getState().chat.currentChat;

    if (currentChat && currentChat._id === messageChat) {
      if (messageData._id) {
        setTimeout(() => {
          markSocketMessagesAsRead(messageChat, [messageData._id]);
        }, 100);
      }
    } else {
      store.dispatch(incrementUnreadCount({ chatId: messageChat }));
      store.dispatch(moveToTop(messageChat));
    }
  });

  // Handle new message notifications

  socket.on("new_message_notification", (notificationData) => {
    store.dispatch(incrementUnreadCount({ chatId: notificationData.chatId }));
    const currentChat = store.getState().chat.currentChat;

    if (!currentChat || currentChat._id !== notificationData.chatId) {
      store.dispatch(incrementUnreadCount({ chatId: notificationData.chatId }));
    }
  });

  // Handle messages as read

  socket.on("messages_read", (readData) => {
    store.dispatch(
      markMessagesAsRead({
        chatId: readData.chatId,
        messageIds: readData.messageIds,
      })
    );
  });

  // User typing indicators
  socket.on("user_typing", (typingData) => {
    store.dispatch(
      setTypingStatus({
        isTyping: typingData.isTyping,
        userId: typingData.userId,
        userType: typingData.userType,
      })
    );
  });

  // Heartbeat handling
  socket.on("heartbeat", () => {
    socket.emit("heartbeat-response");
  });

  socket.on("connect_error", (error) => {
    console.error(`Chat socket connection error:`, error);
    connectionAttempts++;
    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error(
        `Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`
      );
      socket.disconnect();
    }
  });

  socket.on("error", (error) => {
    console.error(`Socket error:`, error);
  });

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      setTimeout(() => {
        socket.connect();
      }, 1000);
    }

    if (reason === "transport close") {
      console.log("Connection lost, automatically attempting to reconnect...");
    }
  });
};

export const joinChat = (chatId: string) => {
  if (!chatSocket) {
    console.error(`Cannot join chat: Chat socket is null`);
    return;
  }

  if (!chatSocket.connected) {
    console.warn(
      `Socket not connected, attempting to connect before joining chat ${chatId}`
    );
    chatSocket.connect();

    chatSocket.once("connect", () => {
      chatSocket?.emit("join-chat", chatId);
      activeChats.add(chatId);
    });
    return;
  }

  chatSocket.emit("join-chat", chatId);
  activeChats.add(chatId);
};

export const leaveChat = (chatId: string) => {
  if (!chatSocket) {
    console.warn(`Cannot leave chat: Chat socket is null`);
    return;
  }

  if (!chatSocket.connected) {
    console.warn(`Socket not connected, cannot leave chat ${chatId}`);
    activeChats.delete(chatId);
    return;
  }

  chatSocket.emit("leave-chat", chatId);
  activeChats.delete(chatId);
};

export const sendSocketMessage = (
  chatId: string,
  message: string,
  senderId: string,
  receiverId: string
) => {
  if (!chatSocket) {
    console.error("Cannot send message: socket is null");
    return false;
  }

  if (!chatSocket.connected) {
    console.error("Cannot send message: socket is not connected");
    return false;
  }

  chatSocket.emit("send-message", {
    chatId,
    message,
    senderId,
    receiverId,
  });
  return true;
};

export const markSocketMessagesAsRead = (
  chatId: string,
  messageIds: string[]
) => {
  if (!chatSocket || !chatSocket.connected) {
    console.error("Cannot mark messages as read: socket is not connected");
    return false;
  }

  chatSocket.emit("mark_as_read", { chatId, messageIds });
  store.dispatch(
    markMessagesAsRead({
      chatId,
      messageIds,
    })
  );

  return true;
};

export const emitTyping = (chatId: string, isTyping: boolean = true) => {
  if (!chatSocket || !chatSocket.connected) return;
  chatSocket.emit("typing", { chatId, isTyping });
};

export const disconnectChatSocket = () => {
  if (chatSocket) {
    activeChats.clear();

    chatSocket.removeAllListeners();
    chatSocket.disconnect();
    chatSocket = null;
  }
};

export const getChatSocket = () => {
  return chatSocket;
};

export const isSocketConnected = () => {
  return chatSocket && chatSocket.connected;
};

export default {
  initializeChatSocket,
  joinChat,
  leaveChat,
  sendSocketMessage,
  markSocketMessagesAsRead,
  emitTyping,
  disconnectChatSocket,
  getChatSocket,
  isSocketConnected,
};
