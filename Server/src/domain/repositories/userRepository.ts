import mongoose, { model, ObjectId, Types } from "mongoose";
import { UserModel } from "../../infrastructure/database/userModel";
import { IEnrolledCourse, IUser } from "../entities/User";
import { CourseModel } from "../../infrastructure/database/courseModel";
import { BundleModel } from "../../infrastructure/database/courseBundleModel";
import {
  IFetchOrderInputs,
  IFetchOrderResponse,
  IOrder,
} from "../entities/order";
import { OrderModel } from "../../infrastructure/database/orderModel";
import bcrypt from "bcrypt";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(userId: string): Promise<IUser | null>;
  create(user: Partial<IUser>): Promise<IUser>;
  update(user: IUser): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
  updateProfileImage(id: string, imageUrl: string): Promise<IUser>;
  updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
  addToWishlist(
    userId: string,
    itemId: string,
    itemType: "Course" | "Bundle"
  ): Promise<IUser | null>;
  removeFromWishlist(userId: string, courseId: string): Promise<boolean>;
  getWishlist(userId: string): Promise<IUser | null>;
  addToCart(
    userId: string,
    courseId: string,
    itemType: "Course" | "Bundle"
  ): Promise<IUser | null>;
  removeFromCart(
    userId: string,
    itemId: string,
    itemType: "Course" | "Bundle"
  ): Promise<boolean>;
  getCart(userId: string): Promise<IUser | null>;
  getEnrolledCourses(userId: string): Promise<IEnrolledCourse[] | null>;
  fetchUserOrders(
    page: number,
    limit: number,
    userId: string
  ): Promise<{ orders: IOrder[] | null; total: number }>;
  isUserEnrolled(
    userId: string,
    courseId: string
  ): Promise<{ isEnrolled: boolean }>;
  verifyPassword(
    hashedPassword: string,
    plainPassword: string
  ): Promise<boolean>;
  updatePassword(userId: string, newHashedPassword: string): Promise<void>;
  createBundleEnrollment(
    userId: string,
    bundleId: string,
    expiryDate: Date,
    enrollmentType: string
  ): Promise<void>;
  checkCourseEnrollment(userId: string, courseId: string): Promise<boolean>;
  updateCourseEnrollment(
    userId: string,
    courseId: string,
    bundleId: string,
    expiryDate: Date
  ): Promise<void>;
  createCourseEnrollment(
    userId: string,
    courseId: string,
    bundleId: string,
    expiryDate: Date,
    enrollmentType: string
  ): Promise<void>;
  deactivateExpiredEnrollments(): Promise<number>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async create(user: Partial<IUser>): Promise<IUser> {
    try {
      const newUser = new UserModel(user);
      const existingUser = await UserModel.findOne({
        username: newUser.username,
      });
      if (existingUser) {
        throw new Error(
          "Username already exists in the database. Please use new username."
        );
      }
      await newUser.save();

      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async findById(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user.toObject();
    } catch (error) {
      throw new Error("Error while fetching user");
    }
  }
  async update(user: IUser): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(user._id, user, {
        new: true,
      });
      if (!updatedUser) {
        throw new Error("User not found");
      }
      return updatedUser.toObject();
    } catch (error) {
      return null;
    }
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return user.toObject();
    } catch (error) {
      return null;
    }
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ googleId });
      if (!user) {
        throw new Error("User not found");
      }
      return user.toObject();
    } catch (error) {
      return null;
    }
  }

  async updateProfileImage(id: string, imageUrl: string): Promise<IUser> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { $set: { profileImg: imageUrl } },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return user.toObject();
    } catch (error) {
      throw new Error("Failed to update profile image");
    }
  }
  async addToWishlist(
    userId: string,
    itemId: string,
    itemType: "Course" | "Bundle"
  ): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.wishlist) {
        user.wishlist = [];
      }

      const objectIdItem =
        typeof itemId === "string" ? new Types.ObjectId(itemId) : itemId;
      user.wishlist.push({
        item: objectIdItem,
        itemType: itemType,
      });

      const result = await user.save();

      const populatedUser = await UserModel.populate(user, {
        path: "wishlist.item",
        select: "_id title price featuredImage durationHours durationMinutes",
        options: { lean: true },
      });

      return populatedUser;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return null;
    }
  }
  async removeFromWishlist(userId: string, itemId: string): Promise<boolean> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: { item: itemId } } },
        { new: true }
      ).populate({
        path: "wishlist",
        populate: [
          { path: "course", model: "Course" },
          { path: "bundle", model: "Bundle" },
        ],
      });
      if (!user) {
        throw new Error("User not found");
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async getWishlist(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId).populate({
        path: "wishlist.item",
        select:
          "_id title price featuredImage durationHours durationMinutes totalPrice discountedPrice",
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw new Error("Error fetching wishlist");
    }
  }

  async addToCart(
    userId: string,
    itemId: string,
    itemType: "Course" | "Bundle"
  ): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.cart) {
        user.cart = [];
      }
      const isItemInCart = user.cart.some(
        (cartItem) =>
          cartItem.item.toString() === itemId && cartItem.itemType === itemType
      );
      if (!isItemInCart) {
        user.cart.push({
          item: new Types.ObjectId(itemId),
          itemType,
        });
      }
      await user.save();
      await this.updateCartTotal(userId);

      const populatedUser = await UserModel.findById(userId).populate({
        path: "cart.item",
        select: "_id title price featuredImage totalPrice discountedPrice",
      });
      return populatedUser;
    } catch (error) {
      return null;
    }
  }
  async removeFromCart(
    userId: string,
    itemId: string,
    itemType: "Course" | "Bundle"
  ): Promise<boolean> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          $pull: {
            cart: {
              item: new Types.ObjectId(itemId),
              itemType: itemType,
            },
          },
        },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      await this.updateCartTotal(userId);

      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    }
  }

  async getCart(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId).populate({
        path: "cart.item",
        select: "_id title price featuredImage discountedPrice totalPrice",
      });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error("Error fetching Cart");
    }
  }

  async updateCartTotal(userId: string): Promise<void> {
    try {
      const user = await UserModel.findById(userId).populate<{
        cart: Array<{
          item: {
            _id: Types.ObjectId;
            price?: number;
            discountedPrice?: number;
          };
          itemType: "Course" | "Bundle";
        }>;
      }>({
        path: "cart.item",
        select: "price discountedPrice",
      });
      if (!user) {
        throw new Error("User not found");
      }
      let total = 0;
      if (user.cart && user.cart.length > 0) {
        for (const cartItem of user.cart) {
          const item = cartItem.item;
          if (item) {
            if (cartItem.itemType === "Bundle" && "discountedPrice" in item) {
              total += item.discountedPrice || 0;
            } else {
              total += item.price || 0;
            }
          }
        }
      }
      user.cartTotal = total;
      await user.save();
    } catch (error) {
      console.error("Error updating cart total:", error);
    }
  }
  async getEnrolledCourses(userId: string): Promise<IEnrolledCourse[] | null> {
    try {
      const user = await UserModel.findById(userId)
        .select("enrolledCourses")
        .populate({
          path: "enrolledCourses.courseId",
          model: "Course",
          select:
            "title description featuredImage durationHours durationMinutes lessons visibility",
        });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.enrolledCourses?.length === 0) {
        throw new Error("No courses enrolled yet!");
      }
      return user.enrolledCourses!.map((course: any) => ({
        courseId: {
          _id: course.courseId._id.toString(),
          title: course.courseId.title,
          description: course.courseId.description,
          featuredImage: course.courseId.featuredImage,
          durationHours: course.courseId.durationHours,
          durationMinutes: course.courseId.durationMinutes,
          lessons: course.courseId.lessons?.map((id: string) => id) || [],
          visibility: course.courseId.visibility,
        },
        enrollmentType: course.enrollmentType,
        enrolledAt: course.enrolledAt,
        progress: course.progress,
        expiryDate: course.expiryDate,
      }));
    } catch (error) {
      throw new Error(
        `${error instanceof Error ? error.message : "Unknown error occured"}`
      );
    }
  }

  async fetchUserOrders(
    page: number,
    limit: number,
    userId: string
  ): Promise<{ orders: IOrder[] | null; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const orders = await OrderModel.find({ userId })
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const total = await OrderModel.countDocuments({ userId });

      return { orders, total };
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  }

  async isUserEnrolled(
    userId: string,
    courseId: string
  ): Promise<{ isEnrolled: boolean }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.enrolledCourses) {
        const isEnrolled = user.enrolledCourses.some(
          (enrollment) => enrollment.courseId.toString() === courseId
        );
        return { isEnrolled };
      }
      return { isEnrolled: false };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check enrollment status: ${error.message}`);
      }
      throw new Error(
        "An unknown error occurred while checking enrollment status"
      );
    }
  }

  async verifyPassword(
    hashedPassword: string,
    plainPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Error verifying password:", error);
      throw error;
    }
  }
  async updatePassword(
    userId: string,
    newHashedPassword: string
  ): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        password: newHashedPassword,
      });
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  async createBundleEnrollment(
    userId: string,
    bundleId: string,
    expiryDate: Date | null,
    enrollmentType: string
  ): Promise<void> {
    try {
      const bundleObjectId =
        typeof bundleId === "string" ? new Types.ObjectId(bundleId) : bundleId;

      await UserModel.findByIdAndUpdate(userId, {
        $push: {
          enrolledBundles: {
            bundleId: bundleObjectId,
            enrollmentType,
            enrolledAt: new Date(),
            expiryDate,
            isActive: true,
          },
        },
      });
    } catch (error) {
      console.error("Failed to create bundle enrollment:", error);
      throw new Error("Failed to create bundle enrollment");
    }
  }

  async checkCourseEnrollment(
    userId: string,
    courseId: string
  ): Promise<boolean> {
    try {
      const user = await UserModel.findOne({
        _id: userId,
        "enrolledCourses.courseId": courseId,
      });
      return !!user;
    } catch (error) {
      console.error("Failed to check course enrollment:", error);
      throw new Error("Failed to check course enrollment");
    }
  }

  async updateCourseEnrollment(
    userId: string,
    courseId: string,
    bundleId: string,
    expiryDate: Date | null
  ): Promise<void> {
    try {
      await UserModel.updateOne(
        {
          _id: userId,
          "enrolledCourses.courseId": courseId,
        },
        {
          $set: {
            "enrolledCourses.$.bundleId": bundleId,
            "enrolledCourses.$.expiryDate": expiryDate,
            "enrolledCourses.$.isActive": true,
          },
        }
      );
    } catch (error) {
      console.error("Failed to update course enrollment:", error);
      throw new Error("Failed to update course enrollment");
    }
  }
  async createCourseEnrollment(
    userId: string,
    courseId: string,
    bundleId: string,
    expiryDate: Date | null,
    enrollmentType: string
  ): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        $addToSet: {
          enrolledCourses: {
            courseId,
            enrollmentType,
            enrolledAt: new Date(),
            progress: 0,
            bundleId,
            expiryDate,
            isActive: true,
          },
        },
      });
    } catch (error) {
      console.error("Failed to create course enrollment:", error);
      throw new Error("Failed to create course enrollment");
    }
  }
  async deactivateExpiredEnrollments(): Promise<number> {
    try {
      const now = new Date();

      const courseResult = await UserModel.updateMany(
        {
          "enrolledCourses.expiryDate": { $lt: now },
          "enrolledCourses.isActive": true,
        },
        {
          $set: { "enrolledCourses.$[expired].isActive": false },
        },
        {
          arrayFilters: [
            { "expired.expiryDate": { $lt: now }, "expired.isActive": true },
          ],
        }
      );

      const bundleResult = await UserModel.updateMany(
        {
          "enrolledBundles.expiryDate": { $lt: now },
          "enrolledBundles.isActive": true,
        },
        {
          $set: { "enrolledBundles.$[expired].isActive": false },
        },
        {
          arrayFilters: [
            { "expired.expiryDate": { $lt: now }, "expired.isActive": true },
          ],
        }
      );

      return courseResult.modifiedCount + bundleResult.modifiedCount;
    } catch (error) {
      console.error("Failed to deactivate expired enrollments:", error);
      throw new Error("Failed to deactivate expired enrollments");
    }
  }
}
