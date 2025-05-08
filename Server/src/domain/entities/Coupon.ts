import { ObjectId } from "mongoose";

export interface ICoupon {
  _id: string | ObjectId;
  code: string;
  discountType: string;
  discountValue: number;
  expiryDate: Date;
  isActive?: boolean;
}
