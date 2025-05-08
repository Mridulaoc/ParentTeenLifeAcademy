import { io } from "../../app";
import {
  ActiveUser,
  emitChatCreation,
} from "../../infrastructure/services/socketService/chatHandler";
import { IChat } from "../entities/Chat";
import { ChatRepository } from "../repositories/chatRepository";

export class CreateOrGetChatUseCase {
  constructor(
    private chatRepository: ChatRepository,
    private activeUsers?: Map<string, ActiveUser>
  ) {}
  async execute(studentId: string, adminId: string): Promise<IChat> {
    try {
      if (!studentId || !adminId) {
        throw new Error("Student and admin IDs are required");
      }
      const chat = await this.chatRepository.findChatByParticipants(
        studentId,
        adminId
      );
      if (chat && chat._id) {
        return await this.chatRepository.findChatById(chat._id.toString());
      }
      const doesStudentExist = await this.chatRepository.checkUserExists(
        studentId,
        "student"
      );
      const doesAdminExist = await this.chatRepository.checkUserExists(
        adminId,
        "admin"
      );
      if (!doesStudentExist || !doesAdminExist) {
        throw new Error("User not found");
      }
      const newChat = await this.chatRepository.createChat(studentId, adminId);

      if (!newChat) {
        throw new Error("Could not create new error");
      }
      if (!newChat._id) {
        throw new Error("New chat created but no ID was assigned");
      }
      const populatedChat = await this.chatRepository.findChatById(
        newChat._id.toString()
      );
      if (this.activeUsers && populatedChat) {
        const chatNamespace = io.of("/chat");
        emitChatCreation(
          chatNamespace,
          this.activeUsers,
          populatedChat,
          adminId
        );
      }
      return populatedChat;
    } catch (error) {
      console.error("Error in CreateOrGetChatUseCase:", error);
      throw error;
    }
  }
}
