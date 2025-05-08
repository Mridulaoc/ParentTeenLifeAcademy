import { Schema, model } from "mongoose";
import { IUser } from "../../domain/entities/User";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    googleId: { type: String, default: null },
    signInMethod: { type: String, default: "normal" },
    profileImg: { type: String },
    phone: { type: String },
    occupation: { type: String },
    dateOfBirth: { type: Date },
    bio: { type: String },
    isBlocked: { type: Boolean, default: false },
    cart: [
      {
        item: {
          type: Schema.Types.ObjectId,
          refPath: "cart.itemType",
          required: true,
        },
        itemType: {
          type: String,
          required: true,
          enum: ["Course", "Bundle"],
          default: "Course",
        },
      },
    ],
    cartTotal: { type: Number, default: 0 },
    wishlist: [
      {
        item: {
          type: Schema.Types.ObjectId,
          refPath: "wishlist.itemType",
          required: true,
        },
        itemType: {
          type: String,
          required: true,
          enum: ["Course", "Bundle"],
          default: "Course",
        },
      },
    ],
    enrolledCourses: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        enrollmentType: {
          type: String,
          enum: ["manual", "auto"],
          required: true,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
        },
        bundleId: {
          type: Schema.Types.ObjectId,
          ref: "Bundle",
          default: null,
        },
        expiryDate: {
          type: Date,
          default: null,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    enrolledBundles: [
      {
        bundleId: {
          type: Schema.Types.ObjectId,
          ref: "Bundle",
          required: true,
        },
        enrollmentType: {
          type: String,
          enum: ["manual", "auto"],
          required: true,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        expiryDate: {
          type: Date,
          default: null,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    usedCoupons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
      },
    ],
  },

  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
