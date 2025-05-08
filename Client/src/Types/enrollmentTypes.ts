import { ICourse } from "./courseTypes";
import { IUser } from "./userTypes";

export interface IEnrollmentState {
  users: IUser[];
  courses: ICourse[];
  userSuggestions: IUser[];
  selectedUser: IUser | null;
  selectedCourse: ICourse | null;
  userLoading: boolean;
  courseLoading: boolean;
  suggestionsLoading: boolean;
  enrollmentLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface IUserSuggestionResponse {
  suggestions: IUser[] | null;
}

export interface ICourseResponse {
  courses: ICourse[];
}

export interface IEnrollmentResponse {
  message: string;
  user: IUser;
}
