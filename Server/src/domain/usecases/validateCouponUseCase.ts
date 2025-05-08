import { ICoupon } from "../entities/Coupon";
import { CouponRepository } from "../repositories/couponRepository";

export class ValidateCouponUseCase {
  constructor(private couponReopsitory: CouponRepository) {}

  async execute(code: string, userId: string): Promise<ICoupon | null> {
    return await this.couponReopsitory.validateCoupon(code, userId);
  }
}
