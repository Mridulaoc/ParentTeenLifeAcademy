import { ICoupon } from "../entities/Coupon";
import { CouponRepository } from "../repositories/couponRepository";

export class CreateCouponUseCase {
  constructor(private couponRepository: CouponRepository) {}
  async execute(data: Omit<ICoupon, "_id">): Promise<ICoupon | null> {
    try {
      const newCoupon = await this.couponRepository.createCoupon(data);
      if (!newCoupon) {
        throw new Error("A coupon with the same code already exists.");
      }
      return newCoupon;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      return null;
    }
  }
}
