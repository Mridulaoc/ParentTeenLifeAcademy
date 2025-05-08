export interface ILiveClassDetails {
  _id?: string;
  title: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  duration: number;
  isRecurring: boolean;
  roomId: string;
  nextOccurrence: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface IClassDataInputs {
  title: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  duration: number;
}

export interface IClassScheduleResponse {
  message: string;
}

export interface IClassInitialState {
  currentClass: ILiveClassDetails | null;
  loading: boolean;
  error: string | null;
}
