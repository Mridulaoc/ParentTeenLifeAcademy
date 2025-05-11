import { IUser } from "./userTypes";

export interface ICartItem {
  itemId: string;
  itemType: "Course" | "Bundle";
  title: string;
  price: number;
}

export interface IOrder {
  _id?: string;
  orderId: string;
  amount: number;
  userId: IUser;
  items: ICartItem[] | null;
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
  paymentId?: string;
}
export interface IOrderFormData {
  amount: number;
  currency: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  couponCode?: string;
  subtotal: number;
  discount: number;
  tax: number;
}

export interface IFetchKeyResponse {
  key: string;
}
export interface IOrderResponse {
  orderId: string;
  amount?: number;
}

export interface IPaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ICoupon {
  _id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiryDate: Date;
  isActive?: boolean;
}

export interface IPaymentState {
  key: string;
  orderId: string | null;
  orderAmount: number | null;
  loading: boolean;
  error: string | null;
  paymentSuccessful: boolean;
  paymentResponse: string | null;
  orders: IOrder[];
  total: number;
  page: number;
  limit: number;
  currentOrder: IOrder | null;
  orderStatus: string | null;
  coupon: ICoupon | null;
  couponLoading: boolean;
  couponError: string | null;
}

export interface IFetchOrderInputs {
  page: number;
  limit: number;
}

export interface IFetchOrderResponse {
  orders: IOrder[];
  page: number;
  limit: number;
  total: number;
}

export interface IConfirmPaymentResponse {
  success: boolean;
  reference?: string;
}

export interface IUpdateOrderInputs {
  orderId: string;
  status: "Pending" | "Completed" | "Failed" | "Cancelled" | "Refunded";
  paymentId?: string;
  signature?: string;
  error?: string;
}

export interface IUpdateOrderStatusResponse {
  success: boolean;
  order: IOrder;
}

export interface ICancelPaymentInput {
  orderId: string;
  reason: "payment_cancelled" | "payment_failed";
}
export interface ICancelPaymentResponse {
  success: boolean;
  message: string;
  order: IOrder;
}

export interface IPaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface IVerifyPaymentResponse {
  success: boolean;
  message: string;
  redirectedTo: string;
}

export interface IValidateCouponResponse {
  success: boolean;
  message: string;
  coupon: ICoupon;
}

export interface ICouponInOrder {
  code?: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  expiryDate?: Date;
}
