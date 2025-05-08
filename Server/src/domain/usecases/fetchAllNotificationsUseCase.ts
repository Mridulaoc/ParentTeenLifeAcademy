import { INotification } from "../entities/Notification";
import { NotificationRepository } from "../repositories/notificationRepository";

export class FetchALLNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}
  async execute(
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }> {
    try {
      const { notifications, total } =
        await this.notificationRepository.fetchAllNotifications(page, limit);
      return { notifications, total };
    } catch (error) {
      throw new Error("Failed to fetch all notifications");
    }
  }
}
