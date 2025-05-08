import {
  sendNotificationToAllUsers,
  sendNotificationToUsers,
} from "../../infrastructure/services/socketService/notificationHandler";
import { INotification } from "../entities/Notification";
import { NotificationRepository } from "../repositories/notificationRepository";
import { io } from "../../app";

export class CreateNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}
  async execute(
    notificationData: Omit<INotification, "_id">
  ): Promise<INotification> {
    try {
      let targetUsers: string[] = [];
      if (
        notificationData.targetType === "specific" &&
        notificationData.targetUsers
      ) {
        targetUsers = notificationData.targetUsers;
      } else if (
        notificationData.targetType !== "all" &&
        notificationData.targetEntity
      ) {
        targetUsers = await this.notificationRepository.fetchTargetUsers(
          notificationData.targetType,
          notificationData.targetEntity
        );
      }

      const notification = {
        title: notificationData.title,
        message: notificationData.message,
        targetType: notificationData.targetType,
        ...(notificationData.targetType !== "specific" &&
        notificationData.targetEntity
          ? { targetEntity: notificationData.targetEntity }
          : {}),
        targetUsers: targetUsers,
        isRead: false,
      };
      const savedNotification = await this.notificationRepository.create(
        notification
      );

      const notificationNamespace = io.of("/notification");
      if (notification.targetType === "all") {
        sendNotificationToAllUsers(notificationNamespace, savedNotification);
      } else if (targetUsers.length > 0) {
        sendNotificationToUsers(
          notificationNamespace,
          targetUsers,
          savedNotification
        );
      }

      return savedNotification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error}`);
    }
  }
}
