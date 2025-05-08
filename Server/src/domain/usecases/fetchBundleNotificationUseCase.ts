import { ICourseBundle } from "../entities/CourseBundle";
import { NotificationRepository } from "../repositories/notificationRepository";
export class FetchBundleNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}
  async execute(): Promise<ICourseBundle[] | null> {
    try {
      const bundles = await this.notificationRepository.fetchBundles();
      return bundles;
    } catch (error) {
      throw new Error(`Error fetching bundle: ${error}`);
    }
  }
}
