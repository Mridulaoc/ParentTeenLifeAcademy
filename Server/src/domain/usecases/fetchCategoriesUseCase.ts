import { ICategory } from "../entities/Category";
import { CategoryRepository } from "../repositories/categoryRepository";

export class FetchCategoriesUseCase {
  constructor(private categoryRepository: CategoryRepository) {}
  async execute(): Promise<{ categories: ICategory[]; message?: string }> {
    try {
      const categories = await this.categoryRepository.fetchCategories();
      if (!categories) {
        throw new Error("No categories found");
      }
      return { categories };
    } catch (error) {
      return {
        categories: [],
        message: "No categories found",
      };
    }
  }
}
