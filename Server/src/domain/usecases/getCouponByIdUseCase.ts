import { ICoupon } from "../entities/Coupon";
import { CouponRepository } from "../repositories/couponRepository";

export class GetCouponByIdUseCase {
  constructor(private couponRepository: CouponRepository) {}

  async execute(id: string): Promise<ICoupon | null> {
    try {
      return await this.couponRepository.getCouponById(id);
    } catch (error) {
      throw new Error("Failed to fetch coupon");
    }
  }
}
