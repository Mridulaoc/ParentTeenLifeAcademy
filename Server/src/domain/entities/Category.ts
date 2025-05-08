import { ObjectId } from "mongoose";

export interface ICategory {
  _id: ObjectId | string;
  name: string;
  description: string;
  isDeleted: boolean;
}
