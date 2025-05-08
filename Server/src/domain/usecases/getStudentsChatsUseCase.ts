import { IChat } from "../entities/Chat";
import { ChatRepository } from "../repositories/chatRepository";

export class GetStudentsChatsUseCase {
  constructor(private chatRepository: ChatRepository) {}
  async execute(studentId: string): Promise<IChat[] | null> {
    try {
      const chats = await this.chatRepository.getStudentChats(studentId);
      return chats;
    } catch (error) {
      throw new Error(`Failed to find chats for student ${studentId}`);
    }
  }
}
