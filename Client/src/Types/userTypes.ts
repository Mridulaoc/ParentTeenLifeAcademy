import { ICourse } from "./courseTypes";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  otp?: string | null;
  otpExpiry?: Date | null;
  googleId?: string | null;
  signInMethod: string;
  profileImg?: string;
  phone?: string | null;
  occupation?: string | null;
  dateOfBirth?: Date | null;
  bio?: string | null;
  createdAt?: Date | null | undefined;
  isBlocked: boolean | null;
  enrolledCourses?: IEnrolledCourse[];
  enrolledBundles?: IEnrolledBundles[];
}

export interface IEnrolledCourse {
  courseId: ICourse;
  enrollmentType: "manual" | "auto";
  enrolledAt: Date;
  progress: number;
  bundleId?: string | null;
  expiryDate?: Date | null;
  isActive?: boolean;
}
export interface IEnrolledBundles {
  bundleId: string | object;
  enrollmentType: "manual" | "auto";
  enrolledAt: Date;
  expiryDate?: Date | null;
  isActive?: boolean;
}

export interface IRegistrationData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface IRegisterUserResponse {
  message: string;
  userId: string;
  token: string;
}
export interface ILoginData {
  email: string;
  password: string;
}
export interface IUserLoginResponse {
  message: string;
  userId: string;
  token: string;
}

export interface IGoogleLoginResponse {
  user: IUser;
  token: string;
}

export interface IUserProfileResponse {
  user: IUser;
}

export interface IUpdateUserInput {
  userData: Partial<IUser>;
}

export interface IForgotPasswordResponse {
  userId: string;
  message: string;
}

export interface IVerifyOTPData {
  userId: string;
  otp: string;
}

export interface IVerifyOTPDataResponse {
  message: string;
}

export interface IResetPasswordData {
  userId: string;
  password: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export interface ICheckStatusResponse {
  isBlocked: boolean;
}

// export interface IEnrolledCourse {
//   courseId: string | object;
//   enrollmentType: "manual" | "auto";
//   enrolledAt: Date;
//   progress: number;
//   bundleId?: string | null;
//   expiryDate?: Date | null;
//   isActive?: boolean;
// }

export interface IUserState {
  user: IUser;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  resetPasswordUserId: string | null;
  enrolledCourses: IEnrolledCourse[];
  isEnrolled: boolean;
}
export interface IEnrollmentStatusResponse {
  isEnrolled: boolean;
}
export interface IChangePasswordInputs {
  oldPassword: string;
  newPassword: string;
}

export interface IChangePasswordResponse {
  message: string;
}
