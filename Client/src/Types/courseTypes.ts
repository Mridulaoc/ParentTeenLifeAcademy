import { ICategory } from "./categoryTypes";
import { ILesson } from "./lessonTypes";

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  visibility: "public" | "private";
  category: ICategory;
  price: number;
  featuredImage?: string;
  introVideoUrl?: string;
  whatYouWillLearn: string;
  targetAudience: string;
  durationHours: number;
  durationMinutes: number;
  lessons: ILesson[];
  createdAt?: Date | null | undefined;
  reviewStats?: ReviewStats;
}

export interface ICourseFormState {
  courses: ICourse[];
  currentCourse: ICourse | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  lessonProgress: ILessonProgress | null;
  lessonsProgress: Record<string, ILessonProgress>;
  certificate: ICertificate | null;
  certificateLoading: boolean;
  certificateError: string | null;
  search: string;
  category: string;
  sort: string;
}

export interface ICourseImageUploadResponse {
  url: string;
}

export interface ICourseIntroVideoUploadResponse {
  url: string;
}

export interface ICourseFormData {
  title: string;
  description: string;
  visibility: "public" | "private";
  category: string;
  price: number;
  introVideoUrl: string;
  whatYouWillLearn: string;
  targetAudience: string;
  durationHours: number;
  durationMinutes: number;
  featuredImage: string;
  lessons: string[];
}

export interface IAddCourseResponse {
  courseId: string;
  message: string;
}

export interface IFetchCoursesInputs {
  page: number;
  limit: number;
}
export interface IFetchPublicCourseInputs {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  sort?: string;
}

export interface IFetchCoursesResponse {
  courses: ICourse[];
  page: number;
  limit: number;
  total: number;
}

export interface ICourseUpdateData {
  title: string;
  description: string;
  visibility: "public" | "private";
  category: string;
  price: number;
  introVideoUrl: string;
  whatYouWillLearn: string;
  targetAudience: string;
  durationHours: number;
  durationMinutes: number;
  featuredImage: string;
}

export interface ICourseCardProps {
  course: ICourse;
}

export interface ICourseDetailsInput {
  courseId: string;
  admin?: string;
}

export interface IUpdateLessonProgressInputs {
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  playbackPosition: number;
}

export interface IUpdateLessonProgressResponse {
  message: string;
  progress?: {
    userId?: string;
    courseId: string;
    lessonId: string;
    isCompleted: boolean;
    playbackPosition: number;
  };
}

export interface ILessonProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  playbackPosition: number;
}
export interface ICertificate {
  _id: string;
  userId: string;
  courseId: string;
  issueDate: Date;
  certificateNumber: string;
}

export interface IGenerateCertificateResponse {
  message: string;
  certificate: ICertificate;
}

export interface IVerifyCertificateResponse {
  isValid: boolean;
  certificate: ICertificate;
  course: {
    title: string;
    description: string;
  };
  issueDate: Date;
}
