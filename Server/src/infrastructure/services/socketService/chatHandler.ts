import { Namespace, Server, Socket } from "socket.io";
import { ChatRepository } from "../../../domain/repositories/chatRepository";
import { IMessage } from "../../../domain/entities/Chat";
const chatRepository = new ChatRepository();
export interface ActiveUser {
  socketId: string;
  userType: "admin" | "student";
  userName: string;
  profileImg?: string;
  lastActive: Date;
}

export const chatHandler = (
  socket: Socket,
  namespace: Namespace | Server,
  activeUsers: Map<string, ActiveUser>
) => {
  const user = socket.data.user;

  if (!user) {
    return;
  }

  socket.on("join-chat", async (chatId) => {
    socket.join(`${chatId}`);

    socket.to(`${chatId}`).emit("user_status_change", {
      userId: user.id,
      userType: user.type,
      status: "online",
      chatId: chatId,
    });
  });

  socket.on("send-message", async (data) => {
    try {
      const { chatId, message, senderId, receiverId } = data;
      const messageObj = {
        sender: user.type,
        senderId,
        content: message,
        timestamp: new Date(),
        read: false,
        chatId: chatId,
      };

      await chatRepository.addMessageToChat(chatId, messageObj);
      namespace.to(`${chatId}`).emit("receive_message", messageObj);
      const receiverInfo = activeUsers.get(receiverId);
      if (receiverInfo) {
        namespace.to(receiverId).emit("new_message_notification", {
          chatId,
          message: messageObj,
          sender: {
            id: user.id,
            name:
              user.type === "admin"
                ? user.name
                : `${user.firstName} ${user.lastName}`,
            profileImg: user.profileImg,
            type: user.type,
          },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("mark_as_read", async (data) => {
    try {
      const { chatId, messageIds } = data;
      await chatRepository.markMessageAsRead(chatId, messageIds, user.id);
      namespace.to(`chat:${chatId}`).emit(`messages_read`, {
        chatId,
        messageIds,
        readBy: user.id,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("typing", async (data) => {
    const { chatId, isTyping } = data;
    socket.to(`${chatId}`).emit("user_typing", {
      chatId,
      userId: user.id,
      isTyping,
      userType: user.type,
    });
  });

  const userId = user.id;
  const userType = user.type;

  const broadcastUserStatus = async (status: "online" | "offline") => {
    try {
      if (userType === "student") {
        const studentChats = await chatRepository.getStudentChats(userId);
        studentChats?.forEach((chat) => {
          namespace.emit("user_status_change", {
            userId,
            userType,
            status,
            chatId: chat._id,
          });
        });
      } else if (userType === "admin") {
        const adminChats = await chatRepository.getAdminChats(userId);
        adminChats?.forEach((chat) => {
          namespace.emit("user_status_change", {
            userId,
            userType,
            status,
            chatId: chat._id,
          });
        });
      }
    } catch (error) {
      console.error(`Error broadcasting ${status} status:`, error);
    }
  };

  broadcastUserStatus("online");

  socket.on("disconnect", () => {
    broadcastUserStatus("offline");
  });
};

export const emitChatCreation = (
  namespace: Namespace | Server,
  activeUsers: Map<string, ActiveUser>,
  chatData: any,
  adminId: string
) => {
  const adminInfo = activeUsers.get(adminId);
  if (adminInfo) {
    namespace.to(adminId).emit("new_chat_created", chatData);
  }
};
