import { IChat } from "../entities/Chat";
import { ChatRepository } from "../repositories/chatRepository";

export class CreateChatUseCase {
  constructor(private chatRepository: ChatRepository) {}
  async execute(studentId: string, adminId: string): Promise<IChat | null> {
    try {
      const chat = await this.chatRepository.createChat(studentId, adminId);
      return chat;
    } catch (error) {
      throw new Error(
        `Failed to create chat between ${studentId} and ${adminId}`
      );
    }
  }
}
