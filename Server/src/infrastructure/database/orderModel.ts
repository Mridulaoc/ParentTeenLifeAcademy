import { model, Schema } from "mongoose";
import { IOrder } from "../../domain/entities/order";

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, required: true },
        itemType: { type: String, enum: ["Course", "Bundle"], required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    billingAddress: {
      type: String,
      required: true,
      set: function (address: any) {
        if (typeof address === "object") {
          return `${address.line1}, ${
            address.line2 ? address.line2 + ", " : ""
          }${address.city}, ${address.state}, ${address.country}, ${
            address.postalCode || address.pincode
          }`;
        }
        return address;
      },
    },
    status: {
      type: String,
      default: "pending",
    },
    coupon: {
      code: { type: String },
      discountType: { type: String, enum: ["percentage", "fixed"] },
      discountValue: { type: Number },
      expiryDate: { type: Date },
    },
    subtotal: { type: Number },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      default: "Payment Successful",
    },
    paymentId: { type: String },
    paymentSignature: { type: String },
    refundId: { type: String },
    refundStatus: { type: String },
  },
  { timestamps: true }
);

export const OrderModel = model<IOrder>("Order", orderSchema);
