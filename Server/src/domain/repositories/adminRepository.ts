import { AdminModel } from "../../infrastructure/database/adminModel";
import { CourseModel } from "../../infrastructure/database/courseModel";
import { UserModel } from "../../infrastructure/database/userModel";
import { IAdmin } from "../entities/Admin";
import { ICourse } from "../entities/Course";
import { IUser } from "../entities/User";

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  fetchUsers(
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }>;
  enrollUser(
    userId: string,
    courseId: string,
    enrollmentType: string
  ): Promise<IUser | null>;
  fetchUserSuggestions(query: string): Promise<IUser[] | null>;
  fetchCourses(): Promise<ICourse[] | null>;
  findAdminId(): Promise<string>;
}

export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    try {
      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        throw new Error("The email address is not valid");
      }
      return admin;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching admin:", error.message);
      }
      return null;
    }
  }

  async fetchUsers(
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const users = await UserModel.find(
        {},
        { username: 1, email: 1, createdAt: 1 }
      )
        .skip(skip)
        .limit(limit);
      const total = await UserModel.countDocuments();

      return { users, total };
    } catch (error) {
      return { users: [], total: 0 };
    }
  }
  async enrollUser(
    userId: string,
    courseId: string,
    enrollmentType: string
  ): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }
      const existingEnrollment = user.enrolledCourses?.find(
        (enrollment) => enrollment.courseId.toString() === courseId
      );
      if (existingEnrollment) {
        throw new Error("User is already enrolled in this course");
      }
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            enrolledCourses: {
              courseId,
              enrollmentType,
              progress: 0,
            },
          },
        },
        { new: true }
      );
      await CourseModel.findByIdAndUpdate(
        courseId,
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );
      return updatedUser;
    } catch (error) {
      return null;
    }
  }

  async fetchUserSuggestions(query: string): Promise<IUser[] | null> {
    try {
      if (!query || query.trim() === "") {
        return [];
      }
      const searchFilter = {
        $or: [
          { username: { $regex: `^${query}`, $options: "i" } },
          { email: { $regex: `^${query}`, $options: "i" } },
        ],
      };
      const suggestions = await UserModel.find(searchFilter)
        .select("_id email username")
        .sort({ username: 1 });

      return suggestions;
    } catch (error) {
      return [];
    }
  }
  async fetchCourses(): Promise<ICourse[] | null> {
    try {
      const courses = await CourseModel.find();
      return courses;
    } catch (error) {
      return [];
    }
  }

  async findAdminId(): Promise<string> {
    try {
      const admin = await AdminModel.findOne();
      if (!admin) {
        throw new Error("Admin not found");
      }

      return admin._id.toString();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching admin ID:", error.message);
      }
      throw error;
    }
  }
}
