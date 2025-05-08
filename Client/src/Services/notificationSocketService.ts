import { io, Socket } from "socket.io-client";
import store from "../Store/store";
import {
  addNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../Features/notificationSlice";

let notificationSocket: Socket | null = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initializeNotificationSocket = (
  userId: string,
  token: string,
  isAdmin = false
) => {
  if (!userId || !token) {
    console.error(
      "Notification socket initialization failed: Missing userId or token"
    );
    return null;
  }

  if (notificationSocket && (notificationSocket as Socket).connected) {
    return notificationSocket;
  }
  if (notificationSocket) {
    notificationSocket.removeAllListeners();
    notificationSocket.disconnect();
    notificationSocket = null;
  }
  connectionAttempts = 0;
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  notificationSocket = io(`${API_BASE_URL}/notification`, {
    path: "/socket.io/",
    transports: ["websocket"],
    auth: {
      token,
      userId,
      userType: isAdmin ? "admin" : "student",
    },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  });

  notificationSocket.on("connect", () => {
    console.log("Notification socket connected!");
  });

  notificationSocket.on("connect_error", (error) => {
    console.error("Notification connection error:", error);
  });
  setupSocketListeners(notificationSocket);
  return notificationSocket;
};
const setupSocketListeners = (socket: Socket) => {
  socket.removeAllListeners();

  socket.on("connect", () => {
    connectionAttempts = 0;
  });

  // Handle new notifications
  socket.on("notification:new", (notification) => {
    store.dispatch(addNotification(notification));
  });

  // Handle connection errors
  socket.on("connect_error", (error) => {
    console.error("Notification socket connection error:", error);
    connectionAttempts++;

    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error(
        `Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`
      );
      socket.disconnect();
    }
  });

  // Handle general socket errors
  socket.on("error", (error) => {
    console.error("Notification socket error:", error);
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      setTimeout(() => {
        socket.connect();
      }, 1000);
    }
  });

  // Handle heartbeat
  socket.on("heartbeat", () => {
    socket.emit("heartbeat-response");
  });
};

// Mark a single notification as read
export const markNotificationRead = (notificationId: string) => {
  if (!notificationSocket || !notificationSocket.connected) {
    console.error("Cannot mark notification as read: socket not connected");
    return false;
  }

  notificationSocket.emit("notification:read", notificationId);
  store.dispatch(markNotificationAsRead(notificationId));
  return true;
};

// Mark all notifications as read

export const markAllNotificationsRead = () => {
  if (!notificationSocket || !notificationSocket.connected) {
    console.error(
      "Cannot mark all notifications as read: socket not connected"
    );
    return false;
  }

  notificationSocket.emit("notification:read-all");
  store.dispatch(markAllNotificationsAsRead());
  return true;
};

// Disconnect the notification socket
export const disconnectNotificationSocket = () => {
  if (notificationSocket) {
    notificationSocket.removeAllListeners();
    notificationSocket.disconnect();
    notificationSocket = null;
  }
};

// Check if the socket is connected
export const isNotificationSocketConnected = () => {
  return notificationSocket && notificationSocket.connected;
};

// Get the current socket instance
export const getNotificationSocket = () => {
  return notificationSocket;
};

export default {
  initializeNotificationSocket,
  markNotificationRead,
  markAllNotificationsRead,
  disconnectNotificationSocket,
  isNotificationSocketConnected,
  getNotificationSocket,
};
