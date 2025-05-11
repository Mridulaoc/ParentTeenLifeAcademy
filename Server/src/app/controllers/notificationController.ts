import { Request, Response } from "express";
import { NotificationRepository } from "../../domain/repositories/notificationRepository";
import { CreateNotificationUseCase } from "../../domain/usecases/createNotificationUseCase";
import { DeleteNotificationUseCase } from "../../domain/usecases/deleteNotificationUseCase";
import { FetchALLNotificationUseCase } from "../../domain/usecases/fetchAllNotificationsUseCase";
import { FetchNotificationUsersUseCase } from "../../domain/usecases/fetchNotificationUsersUseCase";
import { FetchNotificationCourseUsecase } from "../../domain/usecases/fetchNotificationCourseUseCases";
import { FetchBundleNotificationUseCase } from "../../domain/usecases/fetchBundleNotificationUseCase";
import { FetchTargetUsersUseCase } from "../../domain/repositories/fetchTargetUsersUseCase";

const notificationRepository = new NotificationRepository();
const createNotificationUseCase = new CreateNotificationUseCase(
  notificationRepository
);
const deleteNotificationUseCase = new DeleteNotificationUseCase(
  notificationRepository
);
const fetchAllNotificationsUseCase = new FetchALLNotificationUseCase(
  notificationRepository
);

const fetchNotificationUserUseCase = new FetchNotificationUsersUseCase(
  notificationRepository
);

const fetchNotificationCourseUseCase = new FetchNotificationCourseUsecase(
  notificationRepository
);

const fetchBundleNotificationUseCase = new FetchBundleNotificationUseCase(
  notificationRepository
);

const fetchTargetUsersUseCase = new FetchTargetUsersUseCase(
  notificationRepository
);
export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const notificationData = req.body;

    if (
      !notificationData.title ||
      !notificationData.message ||
      !notificationData.targetType
    ) {
      res.status(400).json({
        message: "Missing required notification fields",
      });
      return;
    }
    if (
      notificationData.targetType === "specific" &&
      (!notificationData.targetUsers ||
        notificationData.targetUsers.length === 0)
    ) {
      res.status(400).json({
        message: "Target users are required for specific notifications",
      });
      return;
    }
    if (
      (notificationData.targetType === "course" ||
        notificationData.targetType === "bundle") &&
      !notificationData.targetEntity
    ) {
      res.status(400).json({
        success: false,
        message: `Target entity is required for ${notificationData.targetType} notifications`,
      });
      return;
    }
    const notification = await createNotificationUseCase.execute(
      notificationData
    );
    res
      .status(200)
      .json({ message: "Notification created successfully.", notification });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while creating notification",
    });
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const notificationId = req.params.notificationId;

    const result = await deleteNotificationUseCase.execute(notificationId);
    res.status(200).json({ message: result.message, notificationId });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while deleting notification",
    });
  }
};

export const fetchAllNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const { notifications, total } = await fetchAllNotificationsUseCase.execute(
      page,
      limit
    );
    res.status(200).json({ notifications, total, page, limit });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching all notifications",
    });
  }
};

export const fetchUsersForNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await fetchNotificationUserUseCase.execute();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching notification users",
    });
  }
};

export const fetchCourseForNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await fetchNotificationCourseUseCase.execute();
    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching course for notification",
    });
  }
};

export const fetchBundleForNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await fetchBundleNotificationUseCase.execute();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching bundle for notification",
    });
  }
};

export const fetchTargetUsersForNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const targetUsers = await fetchTargetUsersUseCase.execute(
      entityType,
      entityId
    );
    res.status(200).json(targetUsers);
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching target users for notification",
    });
  }
};
