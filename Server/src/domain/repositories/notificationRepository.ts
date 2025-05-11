import mongoose from "mongoose";
import { BundleModel } from "../../infrastructure/database/courseBundleModel";
import { CourseModel } from "../../infrastructure/database/courseModel";
import { NotificationModel } from "../../infrastructure/database/notificationModel";
import { OrderModel } from "../../infrastructure/database/orderModel";
import { UserModel } from "../../infrastructure/database/userModel";
import { UserNotificationModel } from "../../infrastructure/database/userNotificationModel";
import { ICourse } from "../entities/Course";
import { ICourseBundle } from "../entities/CourseBundle";
import { INotification } from "../entities/Notification";
import { IUser } from "../entities/User";

export interface INotificationRepository {
  create(notificationData: Partial<INotification>): Promise<INotification>;
  fetchAllNotifications(
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }>;
  findById(id: string): Promise<INotification | null>;
  delete(id: string): Promise<boolean>;
  fetchUsers(): Promise<IUser[] | null>;
  fetchCourses(): Promise<ICourse[] | null>;
  fetchBundles(): Promise<{ bundles: ICourseBundle[]; total: number }>;
  fetchTargetUsers(entityType: string, entityId?: string): Promise<string[]>;

  getUserNotifications(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }>;
  markAsRead(notificationId: string, userId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
  getUnreadCount(userId: string): Promise<number>;
}

export class NotificationRepository implements INotificationRepository {
  async create(notificationData: INotification): Promise<INotification> {
    try {
      const newNotification = await NotificationModel.create(notificationData);

      if (
        notificationData.targetUsers &&
        notificationData.targetUsers.length > 0
      ) {
        const userNotifications = notificationData.targetUsers.map(
          (userId) => ({
            userId,
            notificationId: newNotification._id,
            isRead: false,
          })
        );
        await UserNotificationModel.insertMany(userNotifications);
      }
      return newNotification.toObject();
    } catch (error) {
      throw new Error(`Failed to create notification: ${error}`);
    }
  }

  async fetchAllNotifications(
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const notifications = await NotificationModel.find({})
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: -1,
        });
      const total = await NotificationModel.countDocuments();
      return { notifications, total };
    } catch (error) {
      throw new Error(`Failed to find notifications: ${error}`);
    }
  }

  async findById(id: string): Promise<INotification | null> {
    try {
      const notification = await NotificationModel.findById(id);
      return notification;
    } catch (error) {
      throw new Error(`Failed to find notification: ${error}`);
    }
  }
  async delete(id: string): Promise<boolean> {
    try {
      const result = await NotificationModel.findByIdAndDelete(id);
      if (result) {
        await UserNotificationModel.deleteMany({ notificationId: id });
      }
      return result !== null;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error}`);
    }
  }

  async fetchUsers(): Promise<IUser[] | null> {
    try {
      const users = await UserModel.find();
      if (!users) {
        throw new Error("No users found");
      }
      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }

  async fetchCourses(): Promise<ICourse[] | null> {
    try {
      const courses = await CourseModel.find();
      if (!courses) {
        throw new Error("No courses found");
      }
      return courses;
    } catch (error) {
      throw new Error(`Failed to fetch courses: ${error}`);
    }
  }

  async fetchBundles(): Promise<{ bundles: ICourseBundle[]; total: number }> {
    try {
      const bundles = await BundleModel.find();
      if (!bundles) {
        throw new Error("No bundles found");
      }
      const total = await BundleModel.countDocuments();
      return { bundles, total };
    } catch (error) {
      throw new Error(`Failed to fetch bundles: ${error}`);
    }
  }
  async fetchTargetUsers(
    entityType: string,
    entityId: string
  ): Promise<string[]> {
    try {
      if (!entityId && entityType !== "all") {
        return [];
      }
      switch (entityType) {
        case "all":
          const users = await UserModel.find({}, { _id: 1 });
          return users.map((user) => user._id.toString());

        case "course":
          let courseId = new mongoose.Types.ObjectId(entityId);
          const course = await CourseModel.findById(courseId);
          return course
            ? course.studentsEnrolled.map((id) => id.toString())
            : [];
        case "bundle":
          let objectIdEntityId = new mongoose.Types.ObjectId(entityId);

          const bundleOrders = await OrderModel.find(
            {
              "items.itemId": objectIdEntityId,
              "items.itemType": "Bundle",
              status: "Completed",
              paymentStatus: "Payment Successful",
            },
            { userId: 1 }
          );

          const bundleUserIds = bundleOrders.map((order) =>
            order.userId.toString()
          );
          return bundleUserIds;
        default:
          return [];
      }
    } catch (error) {
      throw new Error(`Failed to fetch target users: ${error}`);
    }
  }

  async getUserNotifications(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const query = {
        $or: [{ targetType: "all" }, { targetUsers: { $in: [userId] } }],
      };

      const notifications = await NotificationModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await NotificationModel.countDocuments(query);

      const notificationIds = notifications.map((n) => n._id);
      const userNotifications = await UserNotificationModel.find({
        userId,
        notificationId: { $in: notificationIds },
      }).populate("notificationId");

      const readStatusMap = new Map();
      userNotifications.forEach((un) => {
        readStatusMap.set(un.notificationId.toString(), un.isRead);
      });

      const notificationsWithReadStatus = notifications.map((notification) => {
        const notificationObj = notification.toObject();

        if (notification.targetType !== "all") {
          notificationObj.isRead =
            readStatusMap.get(notification._id.toString()) || false;
        } else {
          const userNotification = userNotifications.find(
            (un) => un.notificationId.toString() === notification._id.toString()
          );
          notificationObj.isRead = userNotification
            ? userNotification.isRead
            : false;
        }

        return notificationObj;
      });

      return { notifications: notificationsWithReadStatus, total };
    } catch (error) {
      throw new Error(`Failed to fetch user notifications: ${error}`);
    }
  }
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notification = await NotificationModel.findById(notificationId);
      if (!notification) {
        return false;
      }

      const userNotification = await UserNotificationModel.findOne({
        userId,
        notificationId,
      });

      if (userNotification) {
        userNotification.isRead = true;
        await userNotification.save();
      } else {
        await UserNotificationModel.create({
          userId,
          notificationId,
          isRead: true,
        });
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error}`);
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const query = {
        $or: [{ targetType: "all" }, { targetUsers: { $in: [userId] } }],
      };

      const notifications = await NotificationModel.find(query);
      const notificationIds = notifications.map((n) => n._id);

      await UserNotificationModel.updateMany(
        { userId, notificationId: { $in: notificationIds } },
        { $set: { isRead: true } }
      );

      const existingEntries = await UserNotificationModel.find({
        userId,
        notificationId: { $in: notificationIds },
      });

      const existingIds = existingEntries.map((e) =>
        e.notificationId.toString()
      );

      const newEntries = notifications
        .filter((n) => !existingIds.includes(n._id.toString()))
        .map((n) => ({
          userId,
          notificationId: n._id,
          isRead: true,
        }));

      if (newEntries.length > 0) {
        await UserNotificationModel.insertMany(newEntries);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error}`);
    }
  }
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const query = {
        $or: [{ targetType: "all" }, { targetUsers: { $in: [userId] } }],
      };

      const notifications = await NotificationModel.find(query);
      const notificationIds = notifications.map((n) => n._id);

      const readNotifications = await UserNotificationModel.find({
        userId,
        notificationId: { $in: notificationIds },
        isRead: true,
      });

      const readIds = readNotifications.map((n) => n.notificationId.toString());

      const unreadCount = notifications.filter(
        (n) => !readIds.includes(n._id.toString())
      ).length;

      return unreadCount;
    } catch (error) {
      throw new Error(`Failed to get unread notification count: ${error}`);
    }
  }
}
