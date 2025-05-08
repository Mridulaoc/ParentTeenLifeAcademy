import { Request, Response } from "express";
import { UserRepository } from "../../domain/repositories/userRepository";
import { AddToWishlistUseCase } from "../../domain/usecases/addToWishlistUseCase";
import { IUser } from "../../domain/entities/User";
import { RemoveFromWishlistUsecase } from "../../domain/usecases/removeFromWishlistUseCase";
import { FetchWishlistUseCase } from "../../domain/usecases/fetchWishlistUseCase";
import { CourseModel } from "../../infrastructure/database/courseModel";
import { BundleModel } from "../../infrastructure/database/courseBundleModel";

const userRepository = new UserRepository();
const addToWishlistUseCase = new AddToWishlistUseCase(userRepository);
const removeFromWishlistUseCase = new RemoveFromWishlistUsecase(userRepository);
const fetchWishlistUseCase = new FetchWishlistUseCase(userRepository);

export const addToWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user._id.toString();
    const { itemId, itemType } = req.body;

    if (!itemId || !itemType) {
      throw new Error("Item ID and Item Type are required");
      return;
    }
    if (!["Course", "Bundle"].includes(itemType)) {
      res.status(400).json({ message: "Invalid item type" });
      return;
    }

    const existingUser = await addToWishlistUseCase.execute(
      userId,
      itemId,
      itemType
    );

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Added to wishlist",
      wishlist: existingUser.wishlist,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const removeFromWishList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = user._id.toString();
    const { itemId } = req.params;
    if (!itemId) {
      res.status(400).json({ message: "ID is required" });
      return;
    }
    const result = await removeFromWishlistUseCase.execute(userId, itemId);

    res.status(200).json({
      message: "Removed from wishlist successfully",
      wishlist: result?.wishlist,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error removing course from wishlist" });
  }
};

export const getWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = user._id.toString();
    const existingUser = await fetchWishlistUseCase.execute(userId);

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ wishlist: existingUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist" });
  }
};
