import { ICourseBundle } from "./courseBundleTypes";
import { ICourse } from "./courseTypes";

export interface ICartItem {
  item: ICourse | ICourseBundle;
  itemType: "Course" | "Bundle";
}

export interface IAddToCartResponse {
  cart: ICartItem[];
  cartTotal: number;
  message: string;
}

export interface ICartState {
  items: ICartItem[];
  loading: boolean;
  error: string | null;
  cartTotal: number;
}

export interface IRemoveFromCartResponse {
  cart: ICartItem[];
  cartTotal: number;
  message: string;
}

export interface IFetchCartResponse {
  cart: ICartItem[];
  cartTotal: number;
}
