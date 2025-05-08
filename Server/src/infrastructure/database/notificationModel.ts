import { model, Schema } from "mongoose";
import { INotification } from "../../domain/entities/Notification";

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["all", "bundle", "course", "specific"],
      required: true,
    },
    targetUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    targetEntity: {
      type: Schema.Types.ObjectId,
      required() {
        return this.targetType === "course" || this.targetType === "bundle";
      },
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
notificationSchema.index({ targetUsers: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const NotificationModel = model<INotification>(
  "Notification",
  notificationSchema
);
