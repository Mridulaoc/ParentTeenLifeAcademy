import { send } from "process";
import { IChat } from "../entities/Chat";
import { ChatRepository } from "../repositories/chatRepository";

export class SendMessageUseCase {
  constructor(private chatRepository: ChatRepository) {}
  async execute(
    chatId: string,
    content: string,
    senderId: string,
    senderRole: "admin" | "student"
  ): Promise<IChat | null> {
    try {
      if (!chatId) {
        throw new Error("Chat ID is required");
      }
      if (!content) {
        throw new Error("Content is required");
      }
      const existingChat = await this.chatRepository.findChatById(chatId);
      if (!existingChat) {
        throw new Error("Chat not found");
      }

      const studentId = existingChat.student.toString();
      const adminId = existingChat.admin.toString();
      if (
        (senderRole === "student" && studentId !== senderId) ||
        (senderRole === "admin" && adminId !== senderId)
      ) {
        throw new Error("Unauthorized to send message");
      }

      const message = {
        sender: senderRole,
        senderId,
        content,
        timestamp: new Date(),
        read: false,
      };
      const updatedChat = await this.chatRepository.addMessageToChat(
        chatId,
        message
      );
      return updatedChat;
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  }
}
