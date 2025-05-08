import mongoose from "mongoose";

export interface IMessage {
  _id?: mongoose.Types.ObjectId | string;
  sender: "student" | "admin";
  senderId: mongoose.Types.ObjectId | string;
  content: string;
  timestamp: Date;
  read: Boolean;
}

export interface IChat {
  _id?: mongoose.Types.ObjectId | string;
  student: mongoose.Types.ObjectId | string;
  admin: mongoose.Types.ObjectId | string;
  messages: IMessage[];
  lastUpdated: Date;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
