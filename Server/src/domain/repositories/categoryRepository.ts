import { CategoryModel } from "../../infrastructure/database/categoryModel";
import { ICategory } from "../entities/Category";

export interface ICategoryRepository {
  fetchCategories(): Promise<ICategory[] | null>;
  create(category: Omit<ICategory, "_id">): Promise<ICategory | null>;
  findById(id: string): Promise<ICategory | null>;
  update(
    id: string,
    name: string,
    description: string
  ): Promise<ICategory | null>;
  findByIdAndDelete(id: string, isDeleted: boolean): Promise<ICategory | null>;
}

export class CategoryRepository implements ICategoryRepository {
  async fetchCategories(): Promise<ICategory[] | null> {
    try {
      const categories = await CategoryModel.find();
      return categories;
    } catch (error) {
      return null;
    }
  }

  async create(category: Omit<ICategory, "_id">): Promise<ICategory | null> {
    try {
      const existingCategory = await CategoryModel.findOne({
        name: { $regex: `^${category.name}$`, $options: "i" },
      });
      if (existingCategory) {
        throw new Error("A category with the same name already exists.");
      }
      const newCategory = new CategoryModel(category);
      return await newCategory.save();
    } catch (error) {
      return null;
    }
  }

  async findById(id: string): Promise<ICategory | null> {
    try {
      const category = await CategoryModel.findById(id);
      if (!category) {
        throw new Error("Could not find category");
      }
      return category;
    } catch (error) {
      return null;
    }
  }

  async update(
    id: string,
    name: string,
    description: string
  ): Promise<ICategory | null> {
    try {
      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        id,
        { name, description },
        { new: true }
      );
      if (!updatedCategory) {
        throw new Error("Could not find category");
      }

      return updatedCategory;
    } catch (error) {
      return null;
    }
  }

  async findByIdAndDelete(
    id: string,
    isDeleted: boolean
  ): Promise<ICategory | null> {
    try {
      const category = await CategoryModel.findByIdAndUpdate(
        id,
        { isDeleted: isDeleted },
        { new: true }
      );
      if (!category) {
        throw new Error("Could not find category");
      }
      return category;
    } catch (error) {
      return null;
    }
  }
}
