import { ICourseBundle } from "../entities/CourseBundle";
import { ICourseBundleRepository } from "../repositories/courseBundleRepository";

export class FetchBundlesUseCase {
  constructor(private courseBundleRepository: ICourseBundleRepository) {}
  async execute(
    page: number,
    limit: number,
    search: string,
    category: string,
    sort: string
  ): Promise<{ bundles: ICourseBundle[]; total: number }> {
    try {
      const result = await this.courseBundleRepository.fetchBundles(
        page,
        limit,
        search,
        category,
        sort
      );
      if (!result) {
        throw new Error("Error fetching bundles");
      }
      return result;
    } catch (error) {
      return {
        bundles: [],
        total: 0,
      };
    }
  }
}
