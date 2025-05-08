import { ICategory } from "../entities/Category";
import { CategoryRepository } from "../repositories/categoryRepository";

export class GetCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}
  async execute(id: string): Promise<ICategory | null> {
    try {
      const category = await this.categoryRepository.findById(id);

      if (!category) {
        throw new Error("Category not found");
      }
      return category;
    } catch (error) {
      return null;
    }
  }
}
