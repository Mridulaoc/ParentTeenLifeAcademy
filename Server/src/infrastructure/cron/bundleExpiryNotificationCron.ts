import cron from "node-cron";
import { sendBundleExpiryNotifications } from "../services/sendBundleExpiryNotification";
export const startBundleExpiryNotificationCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const notificationCount = await sendBundleExpiryNotifications();
    } catch (error) {
      console.error("Error in bundle expiry notification check:", error);
    }
  });
};
