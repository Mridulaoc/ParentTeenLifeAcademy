import { model, Schema } from "mongoose";
import { IUserNotification } from "../../domain/entities/userNotification";

const userNotificationSchema = new Schema<IUserNotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userNotificationSchema.index(
  { userId: 1, notificationId: 1 },
  { unique: true }
);
userNotificationSchema.index({ userId: 1, isRead: 1 });

export const UserNotificationModel = model<IUserNotification>(
  "UserNotification",
  userNotificationSchema
);
