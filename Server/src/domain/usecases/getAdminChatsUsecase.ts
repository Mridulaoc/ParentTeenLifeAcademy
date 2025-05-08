import { IChat } from "../entities/Chat";
import { ChatRepository } from "../repositories/chatRepository";

export class GetAdminChatsUseCase {
  constructor(private chatRepository: ChatRepository) {}
  async execute(adminId: string): Promise<IChat[] | null> {
    try {
      return await this.chatRepository.getAdminChats(adminId);
    } catch (error) {
      throw new Error(`Failed to find chats for admin ${adminId}`);
    }
  }
}
