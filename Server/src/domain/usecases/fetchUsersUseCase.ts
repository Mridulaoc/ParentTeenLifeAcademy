import { IUser } from "../entities/User";
import { AdminRepository } from "../repositories/adminRepository";

export class FetchUsersUseCase {
  constructor(private adminRepository: AdminRepository) {}
  async execute(
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; total: number }> {
    try {
      const result = this.adminRepository.fetchUsers(page, limit);
      if (!result) {
        throw new Error("Error fetching users");
      }
      return result;
    } catch (error) {
      return {
        users: [],
        total: 0,
      };
    }
  }
}
