import { Request, Response } from "express";
import { CouponRepository } from "../../domain/repositories/couponRepository";
import { CreateCouponUseCase } from "../../domain/usecases/createCouponUseCase";
import { FetchCouponsUseCase } from "../../domain/usecases/fetchCouponsUseCase";
import { GetCouponByIdUseCase } from "../../domain/usecases/getCouponByIdUseCase";
import { UpdateCouponUseCase } from "../../domain/usecases/updateCouponUseCase";
import { DeactivateCouponUseCase } from "../../domain/usecases/deactivateCouponUseCase";
import { IUser } from "../../domain/entities/User";
import { ValidateCouponUseCase } from "../../domain/usecases/validateCouponUseCase";

const couponRepository = new CouponRepository();
const createCouponUseCase = new CreateCouponUseCase(couponRepository);
const fetchCouponUsecase = new FetchCouponsUseCase(couponRepository);
const getCouponByIdUseCase = new GetCouponByIdUseCase(couponRepository);
const updateCouponUseCase = new UpdateCouponUseCase(couponRepository);
const deactivateCouponUseCase = new DeactivateCouponUseCase(couponRepository);
const validateCouponUseCase = new ValidateCouponUseCase(couponRepository);

export const createCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, discountType, discountValue, expiryDate } = req.body;
    const couponData = {
      code,
      discountType,
      discountValue,
      expiryDate,
    };
    const coupon = await createCouponUseCase.execute(couponData);
    res.status(201).json({ message: "Coupon added successfully", coupon });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A coupon with the same code already exists."
    ) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error creating coupon" });
  }
};

export const getCoupons = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const { coupons, total } = await fetchCouponUsecase.execute(page, limit);
    res.status(200).json({ coupons, total, page, limit });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching all coupons",
    });
  }
};
export const getCouponById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await getCouponByIdUseCase.execute(id);

    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching the coupon",
    });
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const coupon = await updateCouponUseCase.execute(id, updateData);

    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }

    res.status(200).json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A coupon with the same code already exists."
    ) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error creating coupon" });
  }
};

export const deactivateCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await deactivateCouponUseCase.execute(id, isActive);

    res.status(200).json(result);
  } catch (error) {
    let errorMessage = "Failed to update coupon status";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(400).json({
      message: errorMessage,
    });
  }
};

export const validateCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.body;
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const userId = user._id.toString();
    if (!code) {
      res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
      return;
    }

    const coupon = await validateCouponUseCase.execute(code, userId);

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Invalid or expired coupon code" ||
        error.message === "You have already used this coupon"
      ) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }
    res.status(500).json({ message: "Error validating coupon" });
  }
};
