import { IChat } from "../entities/Chat";
import { ChatRepository } from "../repositories/chatRepository";

export class GetChatUseCase {
  constructor(private chatRepository: ChatRepository) {}
  async execute(chatId: string): Promise<IChat | null> {
    try {
      if (!chatId) {
        throw new Error("Chat ID is required");
      }
      const chat = await this.chatRepository.findChatById(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }
      return chat;
    } catch (error) {
      throw error;
    }
  }
}
