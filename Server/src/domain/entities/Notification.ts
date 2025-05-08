export interface INotification {
  _id?: string;
  title: string;
  message: string;
  targetType: "all" | "bundle" | "course" | "specific";
  targetUsers?: string[];
  targetEntity?: string;
  createdAt?: Date;
  isRead?: boolean;
}
