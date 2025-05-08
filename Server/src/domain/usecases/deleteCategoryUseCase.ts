import { ICategory } from "../entities/Category";
import { CategoryRepository } from "../repositories/categoryRepository";

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}
  async execute(
    categoryId: string,
    isDeleted: boolean
  ): Promise<{ message: string; category: ICategory }> {
    try {
      const category = await this.categoryRepository.findByIdAndDelete(
        categoryId,
        isDeleted
      );
      if (!category) {
        throw new Error("Category not found");
      }
      return {
        message: isDeleted ? "Category deleted" : "Category restored",
        category,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }
}
