import { ICourse } from "./courseTypes";

export interface ICourseBundle {
  _id: string;
  title: string;
  description: string;
  courses: ICourse[];
  totalPrice: number;
  discountedPrice: number;
  featuredImage: string;
  accessType: "lifetime" | "limited";
  accessPeriodDays: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface IBundleState {
  courses: ICourse[];
  bundles: ICourseBundle[];
  loading: boolean;
  error: string | null;
  currentBundle: Partial<ICourseBundle> | null;
  total: number;
  page: number;
  limit: number;
  search: string;
  category: string;
  sort: string;
}

export interface ICreateBundleFormData {
  title: string;
  description: string;
  totalPrice: number;
  discountedPrice: number;
  featuredImage: string;
  courses: string[];
  accessType: "lifetime" | "limited";
  accessPeriodDays?: number | null;
}

export interface ICreateBundleResponse {
  message: string;
}

export interface IFetchBundleInputs {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  sort?: string;
  admin?: string;
}
export interface IFetchBundleResponse {
  bundles: ICourseBundle[];
  page: number;
  limit: number;
  total: number;
}

export interface IBundleUpdateData {
  title: string;
  description: string;
  courses: string[];
  totalPrice: number;
  discountedPrice: number;
  featuredImage: string;
}

export interface IBundleCardProps {
  bundle: ICourseBundle;
}
