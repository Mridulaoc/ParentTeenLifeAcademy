import { error } from "console";
import { ICourseBundle } from "../entities/CourseBundle";
import { ICourseBundleRepository } from "../repositories/courseBundleRepository";

export class FetchBundleDetailsUseCase {
  constructor(private courseBundleRepository: ICourseBundleRepository) {}
  async execute(bundleId: string): Promise<ICourseBundle | null> {
    try {
      const bundle = await this.courseBundleRepository.findBundleById(bundleId);
      if (!bundle) {
        throw new Error("Bundle not found");
      }
      return bundle;
    } catch (error) {
      return null;
    }
  }
}
