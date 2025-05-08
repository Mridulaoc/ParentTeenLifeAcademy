import { model } from "mongoose";
import { Schema } from "mongoose";
import { IChat, IMessage } from "../../domain/entities/Chat";

const messageSchema = new Schema<IMessage>({
  sender: {
    type: String,
    enum: ["student", "admin"],
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    refPath: "sender",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const chatSchema = new Schema<IChat>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    messages: [messageSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

chatSchema.index({ student: 1, admin: 1 }, { unique: true });
export const ChatModel = model<IChat>("Chat", chatSchema);
