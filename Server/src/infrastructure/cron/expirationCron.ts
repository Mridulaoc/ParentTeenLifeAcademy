import cron from "node-cron";
import { UserRepository } from "../../domain/repositories/userRepository";

const userRepository = new UserRepository();

export const startExpirationCron = () => {
  cron.schedule("0 0 0 * * *", async () => {
    try {
      const deactivatedCount =
        await userRepository.deactivateExpiredEnrollments();
    } catch (error) {
      console.error("Error in enrollment expiration check:", error);
    }
  });
};
