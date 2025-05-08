import { ICourseBundleRepository } from "../repositories/courseBundleRepository";

export class DeleteBundleUseCase {
  constructor(private courseBundleRepository: ICourseBundleRepository) {}
  async execute(
    bundleId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const bundle = await this.courseBundleRepository.findBundleById(bundleId);
      if (!bundle) {
        return { success: false, message: "Bundle not found." };
      }
      const deleted = await this.courseBundleRepository.delete(bundleId);
      if (!deleted) {
        return { success: false, message: "Failed to delete bundle." };
      }
      return { success: true, message: "Bundle deleted successfully." };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the bundle",
      };
    }
  }
}
