import { Schema } from "mongoose";

export interface IUserNotification {
  userId: Schema.Types.ObjectId;
  notificationId: Schema.Types.ObjectId;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
