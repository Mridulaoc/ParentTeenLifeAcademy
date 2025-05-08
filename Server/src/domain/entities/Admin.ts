import { ObjectId } from "mongodb";

export interface IAdmin {
  _id: ObjectId | string;
  email: string;
  password: string;
  name: string;
  profileImg: string;
}
