import { ClassModel } from "../../infrastructure/database/classModel";
import { Class, IClass } from "../entities/Class";
import { ClassRepository } from "../repositories/classRepository";

export class ScheduleClassUseCase {
  constructor(private classRepository: ClassRepository) {}
  async execute(classData: Partial<IClass>) {
    try {
      if (classData.duration! <= 0) {
        throw new Error("Duration must be greater than 0");
      }
      const classInstance = new Class(classData as IClass);
      if (classInstance.isRecurring && !classInstance.nextOccurrence) {
        classInstance.nextOccurrence = classInstance.calculateNextOccurrence();
      }

      const createdClass = await this.classRepository.create({
        ...classData,
        nextOccurrence: classInstance.nextOccurrence,
      });
      return createdClass;
    } catch (error) {
      throw new Error("Could not create class");
    }
  }
}
