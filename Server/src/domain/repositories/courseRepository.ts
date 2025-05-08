import { CourseModel } from "../../infrastructure/database/courseModel";
import { ICourse } from "../entities/Course";

export interface ICourseRepository {
  create(
    course: Omit<ICourse, "_id">
  ): Promise<{ courseId: string; message: string }>;
  fetchCourses(
    page: number,
    limit: number
  ): Promise<{ courses: ICourse[]; total: number }>;
  findPublicCourses(
    page: number,
    limit: number,
    search: string,
    category: string,
    sort: string
  ): Promise<{ courses: ICourse[]; total: number }>;
  findCourseById(courseId: string): Promise<ICourse | null>;
  updateCourse(
    courseId: string,
    data: Partial<ICourse>
  ): Promise<ICourse | null>;
  delete(courseId: string): Promise<boolean>;
  updateStudentsEnrolled(
    courseId: string,
    userId: string
  ): Promise<ICourse | null>;
}

export class CourseRepository implements ICourseRepository {
  async create(
    course: Omit<ICourse, "_id">
  ): Promise<{ courseId: string; message: string }> {
    try {
      const existingCourse = await CourseModel.findOne({
        title: { $regex: `^${course.title}$`, $options: "i" },
      });

      if (existingCourse) {
        throw new Error("A Course with the same name already exists.");
      }
      const newCourse = new CourseModel(course);

      await newCourse.save();
      return {
        courseId: newCourse._id.toString(),
        message: "Basic details added",
      };
    } catch (error) {
      if (error instanceof Error) {
        return { courseId: "", message: error.message };
      }
      return { courseId: "", message: "Could not add basic details" };
    }
  }

  async fetchCourses(
    page: number,
    limit: number
  ): Promise<{ courses: ICourse[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const courses = await CourseModel.find(
        {},
        {
          title: 1,
          price: 1,
          createdAt: 1,
          category: 1,
          visibility: 1,
          featuredImage: 1,
          durationHours: 1,
          durationMinutes: 1,
          durationSeconds: 1,
          reviewStats: 1,
        }
      )
        .populate("category")
        .skip(skip)
        .limit(limit);

      const total = await CourseModel.countDocuments();
      return { courses, total };
    } catch (error) {
      return { courses: [], total: 0 };
    }
  }

  async findPublicCourses(
    page: number,
    limit: number,
    search: string,
    category: string,
    sort: string
  ): Promise<{ courses: ICourse[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      let filter: any = { visibility: "public" };
      if (search) {
        filter.$or = [{ title: { $regex: search, $options: "i" } }];
      }
      if (category) {
        filter.category = category;
      }
      let sortOption = {};
      switch (sort) {
        case "popularity":
          sortOption = { "studentsEnrolled.length": -1 };
          break;
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

      const total = await CourseModel.countDocuments(filter);
      const courses = await CourseModel.find(filter)
        .sort(sortOption)
        .populate("category", "name")
        .skip((page - 1) * limit)
        .limit(limit);
      return {
        courses,
        total,
      };
    } catch (error) {
      return { courses: [], total: 0 };
    }
  }

  async findCourseById(courseId: string): Promise<ICourse | null> {
    try {
      const existingCourse = await CourseModel.findById(courseId).populate(
        "lessons"
      );
      if (!existingCourse) {
        throw new Error("Course not found");
      }
      return existingCourse.toObject();
    } catch (error) {
      return null;
    }
  }

  async updateCourse(
    courseId: string,
    data: Partial<ICourse>
  ): Promise<ICourse | null> {
    try {
      const updatedCourse = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );
      if (!updatedCourse) {
        throw new Error("Course not found");
      }
      return updatedCourse.toObject();
    } catch (error) {
      return null;
    }
  }

  async delete(courseId: string): Promise<boolean> {
    try {
      const result = await CourseModel.deleteOne({ _id: courseId });
      return result.deletedCount === 1;
    } catch (error) {
      return false;
    }
  }

  async updateStudentsEnrolled(
    courseId: string,
    userId: string
  ): Promise<ICourse | null> {
    try {
      const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, {
        $addToSet: { studentsEnrolled: userId },
      });
      if (!updatedCourse) {
        throw new Error("Could not update the course");
      }
      return updatedCourse;
    } catch (error) {
      throw error;
    }
  }

  async getPopularCourses(limit: number): Promise<ICourse[]> {
    try {
      let sortOption = {};
      sortOption = { "studentsEnrolled.length": -1 };
      const courses = await CourseModel.find({ visibility: "public" })
        .sort(sortOption)
        .limit(limit);

      console.log("Courses from repo", courses);
      return courses;
    } catch (error) {
      return [];
    }
  }
}
