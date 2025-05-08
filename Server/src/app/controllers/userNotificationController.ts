import { Request, Response } from "express";
import { NotificationRepository } from "../../domain/repositories/notificationRepository";
import { io } from "../../app";
import mongoose from "mongoose";
import { IUser } from "../../domain/entities/User";

const notificationRepository = new NotificationRepository();

// Get all notifications for a specific user
export const getUserNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { notifications, total } =
      await notificationRepository.getUserNotifications(userId, page, limit);

    res.status(200).json({
      notifications,
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch user notifications",
    });
  }
};

export const markNotificationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const userId = user._id.toString();
    const notificationId = req.params.notificationId;

    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    const updated = await notificationRepository.markAsRead(
      notificationId,
      userId
    );

    if (updated) {
      io.to(`user:${userId}`).emit("notification:marked-read", notificationId);

      res.status(200).json({
        message: "Notification marked as read",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
    });
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const userId = user._id.toString();

    const updated = await notificationRepository.markAllAsRead(userId);

    if (updated) {
      io.to(`user:${userId}`).emit("notification:all-marked-read");

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read",
    });
  }
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const userId = user._id.toString();

    const count = await notificationRepository.getUnreadCount(userId);

    res.status(200).json({
      unreadCount: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get unread notification count",
    });
  }
};
