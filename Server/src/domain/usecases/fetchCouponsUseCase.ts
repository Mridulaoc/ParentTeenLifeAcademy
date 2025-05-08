import { ICoupon } from "../entities/Coupon";
import { CouponRepository } from "../repositories/couponRepository";

export class FetchCouponsUseCase {
  constructor(private couponRepository: CouponRepository) {}
  async execute(
    page: number,
    limit: number
  ): Promise<{ coupons: ICoupon[]; total: number }> {
    try {
      const { coupons, total } = await this.couponRepository.fetchCoupons(
        page,
        limit
      );
      return { coupons, total };
    } catch (error) {
      throw new Error("Failed to fetch all coupons");
    }
  }
}
