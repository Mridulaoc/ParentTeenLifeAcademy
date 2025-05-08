import { INotification } from "../../domain/entities/Notification";
import { NotificationRepository } from "../../domain/repositories/notificationRepository";
import { CreateNotificationUseCase } from "../../domain/usecases/createNotificationUseCase";
import { BundleModel } from "../database/courseBundleModel";
import { UserModel } from "../database/userModel";

const notificationRepository = new NotificationRepository();
const createNotificationUseCase = new CreateNotificationUseCase(
  notificationRepository
);

export const sendBundleExpiryNotifications = async () => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(0, 0, 0, 0);

    const endOfTargetDay = new Date(sevenDaysFromNow);
    endOfTargetDay.setHours(23, 59, 59, 999);

    const usersWithExpiringBundles = await UserModel.find({
      enrolledBundles: {
        $elemMatch: {
          expiryDate: {
            $gte: sevenDaysFromNow,
            $lte: endOfTargetDay,
          },
          isActive: true,
        },
      },
    }).select("_id enrolledBundles");

    let notificationCount = 0;

    for (const user of usersWithExpiringBundles) {
      const expiringBundles = user.enrolledBundles!.filter(
        (bundle) =>
          bundle.expiryDate! >= sevenDaysFromNow &&
          bundle.expiryDate! <= endOfTargetDay &&
          bundle.isActive
      );

      if (expiringBundles.length === 0) continue;

      const bundleIds = expiringBundles.map((bundle) => bundle.bundleId);
      const bundleDetails = await BundleModel.find({
        _id: { $in: bundleIds },
      }).select("title");

      const bundleNames = bundleDetails
        .map((bundle) => bundle.title)
        .join(", ");

      const notificationData: Omit<INotification, "_id"> = {
        title: "Bundle Access Expiring Soon",
        message: `Your access to ${bundleNames} will expire in 7 days.`,
        targetType: "specific",
        targetUsers: [user._id.toString()],
        isRead: false,
      };

      await createNotificationUseCase.execute(notificationData);
      notificationCount++;
    }

    return notificationCount;
  } catch (error) {
    console.error("Failed to send bundle expiry notifications:", error);
    throw new Error("Failed to send bundle expiry notifications");
  }
};
