import { ObjectId } from "mongoose";

export interface ICartItem {
  itemId: ObjectId | string;
  itemType: "Course" | "Bundle";
  title: string;
  price: number;
}

export interface IOrder {
  _id?: ObjectId | string;
  orderId: string;
  amount: number;
  userId: string | ObjectId;
  items: ICartItem[] | null;
  paymentId?: string;
  paymentSignature?: string;
  billingAddress: string;
  status?: string;
  paymentStatus?: string;
  refundId?: string;
  refundStatus?: string;
  coupon?: ICouponInOrder;
  subtotal?: number;
  discount?: number;
  tax?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IFetchOrderInputs {
  page: number;
  limit: number;
  userId: ObjectId;
}

export interface IFetchOrderResponse {
  orders: IOrder[] | null;
  total: number;
}

export interface ICouponInOrder {
  code?: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  expiryDate?: Date;
}
