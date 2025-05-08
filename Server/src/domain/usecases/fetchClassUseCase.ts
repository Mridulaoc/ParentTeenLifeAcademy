import { IClass } from "../entities/Class";
import { ClassRepository } from "../repositories/classRepository";

export class FetchClassUseCase {
  constructor(private classRepository: ClassRepository) {}
  async execute(): Promise<IClass | null> {
    try {
      const classData = await this.classRepository.fetchClass();
      if (!classData) {
        throw new Error("Class not found");
      }
      return classData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch class");
    }
  }
}
