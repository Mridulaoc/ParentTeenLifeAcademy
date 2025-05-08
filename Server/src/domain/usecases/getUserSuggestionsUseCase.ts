import { IUser } from "../entities/User";
import { AdminRepository } from "../repositories/adminRepository";

export class GetUserSuggestionsUsecase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(query: string): Promise<IUser[] | null> {
    try {
      if (!query || query.trim() === "") {
        throw new Error("Invalid query");
      }
      const suggestions = await this.adminRepository.fetchUserSuggestions(
        query
      );
      return suggestions;
    } catch (error) {
      return null;
    }
  }
}
