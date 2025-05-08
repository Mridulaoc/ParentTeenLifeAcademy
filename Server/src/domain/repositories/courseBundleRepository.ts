import { BundleModel } from "../../infrastructure/database/courseBundleModel";
import { CourseModel } from "../../infrastructure/database/courseModel";
import { ICourse } from "../entities/Course";
import { ICourseBundle } from "../entities/CourseBundle";

export interface ICourseBundleRepository {
  fetchAllCourses(): Promise<ICourse[] | null>;
  createBundle(
    courseBundle: Partial<ICourseBundle>
  ): Promise<{ message: string }>;
  fetchBundles(
    page: number,
    limit: number,
    search: string,
    category: string,
    sort: string
  ): Promise<{ bundles: ICourseBundle[]; total: number }>;
  findBundleById(bundleId: string): Promise<ICourseBundle | null>;
  delete(bundleId: string): Promise<boolean>;
  updateBundle(
    data: Partial<ICourseBundle>,
    bundleId: string
  ): Promise<ICourseBundle | null>;
}

export class CourseBundleRepository implements ICourseBundleRepository {
  async fetchAllCourses(): Promise<ICourse[] | null> {
    try {
      const courses = await CourseModel.find(
        {},
        { title: 1, price: 1, featuredImage: 1 }
      );
      return courses;
    } catch (error) {
      return null;
    }
  }
  async createBundle(
    courseBundle: Partial<ICourseBundle>
  ): Promise<{ message: string }> {
    try {
      const existingBundle = await BundleModel.findOne({
        title: { $regex: `^${courseBundle.title}`, $options: "i" },
      });
      if (existingBundle) {
        throw new Error(`A bundle with same name already exists`);
      }
      const newBundle = new BundleModel(courseBundle);

      await newBundle.save();
      return { message: "Bundle created successfully" };
    } catch (error) {
      if (error instanceof Error) {
        return { message: error.message };
      }
      return { message: "Could not create bundle" };
    }
  }
  async fetchBundles(
    page: number,
    limit: number,
    search: string,
    category: string,
    sort: string
  ): Promise<{ bundles: ICourseBundle[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      let filter: any = {};
      if (search) {
        filter.$or = [{ title: { $regex: search, $options: "i" } }];
      }
      if (category) {
        filter.category = category;
      }
      let sortOption = {};
      switch (sort) {
        case "popularity":
          sortOption = { totalPrice: -1 };
          break;
        case "lowest-price":
        case "a-z":
          sortOption = { title: 1 };
          break;
        case "z-a":
          sortOption = { title: -1 };
          break;
        case "latest":
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }

      const bundles = await BundleModel.find(filter)
        .sort(sortOption)
        .populate("courses", "title category featuredImage")
        .skip(skip)
        .limit(limit);
      const total = await BundleModel.countDocuments(filter);
      return { bundles, total };
    } catch (error) {
      return { bundles: [], total: 0 };
    }
  }

  async findBundleById(bundleId: string): Promise<ICourseBundle | null> {
    try {
      const existingBundle = await BundleModel.findById(bundleId).populate(
        "courses"
      );
      if (!existingBundle) {
        throw new Error("Bundle not found");
      }
      return existingBundle.toObject();
    } catch (error) {
      return null;
    }
  }
  async delete(bundleId: string): Promise<boolean> {
    try {
      const result = await BundleModel.deleteOne({ _id: bundleId });
      return result.deletedCount === 1;
    } catch (error) {
      return false;
    }
  }

  async updateBundle(
    data: Partial<ICourseBundle>,
    bundleId: string
  ): Promise<ICourseBundle | null> {
    try {
      const updatedBundle = await BundleModel.findByIdAndUpdate(
        bundleId,
        { $set: data },
        { new: true }
      );
      if (!updatedBundle) {
        throw new Error("Bundle not found");
      }
      return updatedBundle.toObject();
    } catch (error) {
      return null;
    }
  }
}
