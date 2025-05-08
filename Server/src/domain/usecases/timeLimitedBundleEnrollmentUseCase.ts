import { CourseRepository } from "../repositories/courseRepository";
import { UserRepository } from "../repositories/userRepository";

export class TimeLimitedBundleEnrollmentUseCase {
  constructor(
    private userRepository: UserRepository,
    private courseRepository: CourseRepository
  ) {}

  async execute(
    userId: string,
    bundleId: string,
    courses: string[],
    expiryDate: Date,
    enrollmentType: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.userRepository.createBundleEnrollment(
        userId,
        bundleId,
        expiryDate,
        enrollmentType
      );

      for (const courseId of courses) {
        const isAlreadyEnrolled =
          await this.userRepository.checkCourseEnrollment(userId, courseId);

        if (isAlreadyEnrolled) {
          await this.userRepository.updateCourseEnrollment(
            userId,
            courseId,
            bundleId,
            expiryDate
          );
        } else {
          await this.userRepository.createCourseEnrollment(
            userId,
            courseId,
            bundleId,
            expiryDate,
            enrollmentType
          );

          await this.courseRepository.updateStudentsEnrolled(courseId, userId);
        }
      }

      return { success: true, message: "Enrolled in time-limited bundle" };
    } catch (error) {
      console.error("Error in time-limited bundle enrollment use case:", error);
      throw new Error("Failed to enroll user in time-limited bundle");
    }
  }
}

// class TimeLimitedBundleEnrollmentUseCase {
//   constructor(
//     private userRepository: UserRepository,
//     private bundleRepository: ICourseBundleRepository
//   ) {}

//   async execute(
//     userId: string,
//     bundleId: string,
//     courseIds: string[],
//     expiryDate: Date,
//     enrollmentType: "manual" | "auto"
//   ): Promise<IUser | null> {
//     try {
//       // 1. Enroll user in the bundle with expiry date
//       const user = await UserModel.findByIdAndUpdate(
//         userId,
//         {
//           $push: {
//             enrolledBundles: {
//               bundleId,
//               enrollmentType,
//               enrolledAt: new Date(),
//               expiryDate,
//               isActive: true,
//             },
//           },
//         },
//         { new: true }
//       );

//       if (!user) {
//         throw new Error("User not found");
//       }

//       // 2. Enroll user in all courses from the bundle with the same expiry date
//       for (const courseId of courseIds) {
//         await UserModel.findByIdAndUpdate(userId, {
//           $push: {
//             enrolledCourses: {
//               courseId,
//               enrollmentType,
//               enrolledAt: new Date(),
//               progress: 0,
//               bundleId,
//               expiryDate,
//               isActive: true,
//             },
//           },
//         });

//         // Update the course's enrolled students
//         await CourseModel.findByIdAndUpdate(courseId, {
//           $push: { studentsEnrolled: userId },
//         });
//       }

//       return user;
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error(`Bundle enrollment error: ${error.message}`);
//       }
//       return null;
//     }
//   }
// }
