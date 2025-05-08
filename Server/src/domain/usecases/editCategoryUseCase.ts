import { ICategory } from "../entities/Category";
import { CategoryRepository } from "../repositories/categoryRepository";

export class EditCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}
  async execute(
    id: string,
    name: string,
    description: string
  ): Promise<ICategory | null> {
    try {
      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error("Category not found");
      }

      const updatedCategory = await this.categoryRepository.update(
        id,
        name,
        description
      );
      if (!updatedCategory) {
        throw new Error("Failed to update category");
      }

      return updatedCategory;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }
}
