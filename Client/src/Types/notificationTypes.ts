import { ICourseBundle } from "./courseBundleTypes";
import { ICourse } from "./courseTypes";
import { IUser } from "./userTypes";

export interface INotification {
  _id?: string;
  title: string;
  message: string;
  targetType: "all" | "bundle" | "course" | "liveClass" | "specific";
  targetUsers?: string[];
  targetEntity?: string;
  createdAt?: Date;
  isRead?: boolean;
}

export interface INotificationState {
  notifications: INotification[] | null;
  userNotifications: IUserNotification[];
  users: IUser[];
  courses: ICourse[] | null;
  bundles: ICourseBundle[] | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface IFetchNotificationInput {
  page: number;
  limit: number;
}
export interface IFetchNotificationResponse {
  notifications: INotification[] | null;
  total: number;
  page: number;
  limit: number;
}

export interface IFetchUserResponse {
  users: IUser[];
}

export interface IFetchCourseResponse {
  courses: ICourse[];
}

export interface IFetchBundleResponse {
  bundles: ICourseBundle[] | null;
}

export interface IfetchTargetUsersInput {
  entityType: string;
  entityId: string;
}

export interface IFetchTargetUsersResponse {
  targetUsers: IUser[] | null;
}

export interface INotificationFormData {
  title: string;
  message: string;
  targetType: string;
  targetEntity?: string;
  targetUsers?: string[];
}

export interface ICreateNotificationResponse {
  message: string;
  notification: INotification;
}

export interface IDeleteNotificationResponse {
  message: string;
  notificationId: string;
}

export interface IUserNotification {
  _id?: string;
  createdAt: string | Date;
  isRead: boolean;
  message: string;
  targetEntity: string;
  targetType: string;
  targetUsers: string[];
  title: string;
  updatedAt: string | Date;
}
export interface IUserNotificationsResponse {
  notifications: IUserNotification[];
  total: number;
  page: number;
  limit: number;
}

export interface IUserNotificationsInput {
  userId: string;
  page: number;
  limit: number;
}

export interface IMarkupNotificationInput {
  userId: string;
  notificationId: string;
}

export interface IMarkupNotificationResponse {
  message: string;
  notificationId: string;
}

export interface IMarkupAllNotificationsResponse {
  message: string;
}

export interface IUnreadNotificationsResponse {
  unreadCount: number;
}
