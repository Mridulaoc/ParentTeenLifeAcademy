export interface ICreateCouponInput {
  code: string;
  discountType: string;
  discountValue: number;
  expiryDate: Date;
}

export interface ICreateCouponResponse {
  message: string;
  coupon: ICoupon;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  expiryDate: Date;
  isActive?: boolean;
}

export interface ICouponState {
  coupons: ICoupon[];
  coupon: ICoupon | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

export interface IFetchCouponInputs {
  page: number;
  limit: number;
}
export interface IFetchCouponResponse {
  coupons: ICoupon[];
  total: number;
  page: number;
  limit: number;
}

export interface IUpdateCouponInput {
  id: string;
  couponData: ICreateCouponInput;
}
export interface IUpdateCouponResponse {
  message: string;
  coupon: ICoupon;
}

export interface ICouponDeactivateInput {
  id: string;
  isActive: boolean;
}
export interface ICouponDeactivateResponse {
  message: string;
  coupon: ICoupon;
}
