export interface ICategory {
  _id: string;
  name: string;
  description: string;
  createdAt?: Date | null | undefined;
  isDeleted?: boolean;
}

export interface ICategoryInput {
  admin?: string | null;
}

export interface ICategoryResponse {
  categories: ICategory[];
}
export interface ICategoryFormData {
  name: string;
  description: string;
}

export interface ICategoryState {
  categories: ICategory[];
  loading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
  addCategorySuccess: boolean;
  category: ICategory;
}
