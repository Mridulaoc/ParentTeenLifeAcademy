import { ICategory } from "../entities/Category";
import { CategoryRepository } from "../repositories/categoryRepository";

export class AddCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(
    categoryData: Omit<ICategory, "_id">
  ): Promise<ICategory | null> {
    try {
      const newcategory = await this.categoryRepository.create(categoryData);
      if (!newcategory) {
        throw new Error("A category with the same name already exists.");
      }
      return newcategory;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
    return null;
  }
}
