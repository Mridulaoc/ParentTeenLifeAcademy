import { IChat } from "../entities/Chat";
import { ChatRepository } from "../repositories/chatRepository";

export class MarkMessagesAsReadUseCase {
  constructor(private chatRepository: ChatRepository) {}
  async execute(
    chatId: string,
    messageIds: string[],
    readerId: string
  ): Promise<IChat | null> {
    try {
      if (!chatId) {
        throw new Error("Chat ID is required");
      }

      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        throw new Error("Message IDs must be a non-empty array");
      }

      if (!readerId) {
        throw new Error("Reader ID is required");
      }

      return await this.chatRepository.markMessageAsRead(
        chatId,
        messageIds,
        readerId
      );
    } catch (error) {
      throw new Error("Could not mark message as read");
    }
  }
}
