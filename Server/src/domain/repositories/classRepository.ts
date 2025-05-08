import { ClassModel } from "../../infrastructure/database/classModel";
import { IClass } from "../entities/Class";

export interface IClassRepository {
  create(classData: Partial<IClass>): Promise<IClass | null>;
  findByRoomId(roomId: string): Promise<IClass | null>;
  fetchClass(): Promise<IClass | null>;
}

export class ClassRepository implements IClassRepository {
  async create(classData: Partial<IClass>): Promise<IClass | null> {
    try {
      const createdClass = await ClassModel.create(classData);
      return createdClass;
    } catch (error) {
      console.error("Error creating class in repository:", error);
      return null;
    }
  }

  async findByRoomId(roomId: string): Promise<IClass | null> {
    try {
      const classData = await ClassModel.findOne({ roomId });
      return classData;
    } catch (error) {
      console.error("Error finding class by roomId:", error);
      return null;
    }
  }

  async fetchClass(): Promise<IClass | null> {
    try {
      const classData = await ClassModel.find();
      return classData[0];
    } catch (error) {
      return null;
    }
  }
}
