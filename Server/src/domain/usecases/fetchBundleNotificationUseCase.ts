import { ICourseBundle } from "../entities/CourseBundle";
import { NotificationRepository } from "../repositories/notificationRepository";
export class FetchBundleNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}
  async execute(): Promise<{ bundles: ICourseBundle[]; total: number }> {
    try {
      const result = await this.notificationRepository.fetchBundles();
      return result;
    } catch (error) {
      throw new Error(`Error fetching bundle: ${error}`);
    }
  }
}
