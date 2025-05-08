import { IUser } from "../entities/User";
import { NotificationRepository } from "../repositories/notificationRepository";

export class FetchNotificationUsersUseCase {
  constructor(private notificationRepository: NotificationRepository) {}
  async execute(): Promise<IUser[] | null> {
    try {
      const user = await this.notificationRepository.fetchUsers();
      if (!user) {
        throw new Error("No users found");
      }
      return user;
    } catch (error) {
      throw new Error(`Erron fetching users${error}`);
    }
  }
}
