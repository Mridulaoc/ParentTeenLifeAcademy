import { ICourse } from "./courseTypes";
import { ICourseBundle } from "./courseBundleTypes";

export interface IWishlistItem {
  item: ICourse | ICourseBundle;
  itemType: "Course" | "Bundle";
  _id: string;
}

export interface IWishlistState {
  items: IWishlistItem[];
  loading: boolean;
  error: string | null;
}

export interface IAddToWishlistResponse {
  wishlist: IWishlistItem[];
  message: string;
}

export interface IRemoveFromWishlistResponse {
  wishlist: IWishlistItem[];
  message: string;
}

export interface IFetchWishlistResponse {
  wishlist: IWishlistItem[];
}

export interface IWishlistActionParams {
  itemId: string;
  itemType: "Course" | "Bundle";
}
