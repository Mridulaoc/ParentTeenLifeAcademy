export interface ICertificate {
  _id?: string;
  userId: string;
  courseId: string;
  issueDate: Date;
  certificateNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}
