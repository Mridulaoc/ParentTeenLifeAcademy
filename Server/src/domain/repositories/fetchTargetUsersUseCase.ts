import { NotificationRepository } from "./notificationRepository";

export class FetchTargetUsersUseCase {
  constructor(private notificationRepository: NotificationRepository) {}
  async execute(
    entityType: string,
    entityId: string
  ): Promise<string[] | null> {
    try {
      const targetUsers = await this.notificationRepository.fetchTargetUsers(
        entityType,
        entityId
      );
      return targetUsers;
    } catch (error) {
      throw new Error(`error fetching target users: ${error}`);
    }
  }
}
