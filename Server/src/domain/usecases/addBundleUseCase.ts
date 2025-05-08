import { ICourseBundle } from "../entities/CourseBundle";
import { ICourseBundleRepository } from "../repositories/courseBundleRepository";

export class AddBundleUseCase {
  constructor(private courseBundleRepository: ICourseBundleRepository) {}

  async execute(
    bundleData: Partial<ICourseBundle>
  ): Promise<{ message: string }> {
    try {
      const result = await this.courseBundleRepository.createBundle(bundleData);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      return { message: "Could not create bundle" };
    }
  }
}
