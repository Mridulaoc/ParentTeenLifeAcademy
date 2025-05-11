export interface ILesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  createdAt?: Date | null;
  duration?: number;
}

export interface ILessonFormData {
  title: string;
  description?: string;
  videoUrl: string;
}

export interface ILessonState {
  lessons: ILesson[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

export interface IAddLessonResponse {
  message: string;
}

export interface IFetchLessonInputs {
  page: number;
  limit: number;
}

export interface IFetchLessonsResponse {
  lessons: ILesson[];
  total: number;
  page: number;
  limit: number;
}

export interface IUpdateLessonInputs {
  lessonId: string;
  lessonData: {
    title: string;
    description: string;
    videoUrl: string;
  };
}

export interface IUpdateLessonResponse {
  message: string;
  lesson: ILesson;
}
