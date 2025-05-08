import { AdminModel } from "../../infrastructure/database/adminModel";
import { ChatModel } from "../../infrastructure/database/chatModel";
import { UserModel } from "../../infrastructure/database/userModel";
import { IChat, IMessage } from "../entities/Chat";

export interface IChatRepository {
  getAdminChats(id: string): Promise<IChat[] | null>;
  findChatById(chatId: string): Promise<IChat | null>;
  findChatByParticipants(
    studentId: string,
    adminId: string
  ): Promise<IChat | null>;
  createChat(studentId: string, adminId: string): Promise<IChat>;
  checkUserExists(userId: string, role: string): Promise<boolean>;
  addMessageToChat(
    chatId: string,
    message: {
      sender: "admin" | "student";
      senderId: string;
      content: string;
      timestamp: Date;
      read: boolean;
    }
  ): Promise<IChat | null>;
  getStudentChats(studentId: string): Promise<IChat[] | null>;
  markMessageAsRead(
    chatId: string,
    messageIds: string[],
    readerId: string
  ): Promise<IChat | null>;
}

export class ChatRepository implements IChatRepository {
  async getAdminChats(id: string): Promise<IChat[] | null> {
    try {
      const chats = await ChatModel.find({ admin: id })
        .populate("student", "firstName lastName userName email profileImg")
        .sort({ lastUpdated: -1 });

      const chatsWithUnread = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = chat.messages.filter(
            (msg) => msg.sender === "student" && !msg.read
          ).length;
          return {
            ...chat.toObject(),
            unreadCount,
          };
        })
      );
      return chatsWithUnread;
    } catch (error) {
      throw new Error(`Failed to get admin chats`);
    }
  }
  async findChatById(chatId: string): Promise<IChat> {
    try {
      const chat = await ChatModel.findById(chatId)
        .populate("student", "firstName lastName userName email profileImg")
        .populate("admin", "name email profileImg");
      if (!chat) {
        throw new Error("Chat not found");
      }
      return chat;
    } catch (error) {
      console.error("Error fetching chat by id:", error);
      throw new Error("Could not fetch chat");
    }
  }
  async findChatByParticipants(
    studentId: string,
    adminId: string
  ): Promise<IChat | null> {
    try {
      const chat = await ChatModel.findOne({
        student: studentId,
        admin: adminId,
      })
        .populate("student", "firstName lastName userName email profileImg")
        .populate("admin", "name email profileImg");

      return chat;
    } catch (error) {
      console.error("Error fetching chat by participants:", error);
      return null;
    }
  }

  async getStudentChats(studentId: string): Promise<IChat[] | null> {
    try {
      const chats = await ChatModel.find({ student: studentId })
        .populate("admin", "name email profileImg")
        .sort({ lastUpdated: -1 });

      const chatsWithUnread = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = chat.messages.filter(
            (msg) => msg.sender === "admin" && !msg.read
          ).length;
          return {
            ...chat.toObject(),
            unreadCount,
          };
        })
      );
      return chatsWithUnread;
    } catch (error) {
      throw new Error(`Error fetching chat by students:, ${error}`);
    }
  }
  async createChat(studentId: string, adminId: string): Promise<IChat> {
    try {
      let chat = await ChatModel.findOne({
        student: studentId,
        admin: adminId,
      });
      if (!chat) {
        chat = new ChatModel({
          student: studentId,
          admin: adminId,
          messages: [],
        });
        await chat.save();
      }

      return chat;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  }
  async checkUserExists(userId: string, role: string): Promise<boolean> {
    try {
      if (role === "student") {
        const user = await UserModel.findById(userId);
        return !!user;
      } else if (role === "admin") {
        const admin = await AdminModel.findById(userId);
        return !!admin;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  async addMessageToChat(
    chatId: string,
    message: Omit<IMessage, "_id">
  ): Promise<IChat | null> {
    try {
      const chat = await ChatModel.findById(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }
      chat.messages.push(message);
      chat.lastUpdated = new Date();
      await chat.save();

      return chat;
    } catch (error) {
      console.error("Error adding message to chat:", error);
      return null;
    }
  }

  async markMessageAsRead(
    chatId: string,
    messageIds: string[],
    readerId: string
  ): Promise<IChat | null> {
    try {
      const chat = await ChatModel.findById(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }
      chat.messages.forEach((message) => {
        if (
          message._id &&
          messageIds.includes(message._id.toString()) &&
          message.senderId.toString() !== readerId
        ) {
          message.read = true;
        }
      });
      await chat.save();
      return chat;
    } catch (error) {
      throw new Error(`Failed to mark messages as read`);
    }
  }
}
