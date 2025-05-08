import { Request, Response } from "express";
import { UserRepository } from "../../domain/repositories/userRepository";
import { AddToCartUseCase } from "../../domain/usecases/addToCartUsecase";
import { IUser } from "../../domain/entities/User";
import { RemoveFromCartUseCase } from "../../domain/usecases/removeFromCartUseCase";
import { FetchFromCartUseCase } from "../../domain/usecases/fetchFromCartUseCase";
import { GetEnrolledCoursesUseCase } from "../../domain/usecases/getEnrolledCoursesUseCase";

const userRepository = new UserRepository();
const addToCartUseCase = new AddToCartUseCase(userRepository);
const removeFromCartUseCase = new RemoveFromCartUseCase(userRepository);
const fetchFromCartUseCase = new FetchFromCartUseCase(userRepository);
const getEnrolledCoursesUseCase = new GetEnrolledCoursesUseCase(userRepository);
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user._id.toString();
    const { id, itemType } = req.body;

    if (!id) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }

    const result = await addToCartUseCase.execute(userId, id, itemType);

    res.status(200).json({
      message: `${itemType}added to cart successfully`,
      cart: result?.cart,
      cartTotal: result?.cartTotal,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to add course to cart" });
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user._id.toString();
    const { itemId } = req.params;
    const { itemType } = req.query;

    if (!itemId) {
      res.status(400).json({ message: "Course ID is required" });
      return;
    }
    const result = await removeFromCartUseCase.execute(
      userId,
      itemId,
      itemType as "Course" | "Bundle"
    );

    res.status(200).json({
      message: `${itemType} removed from cart successfully`,
      cart: result?.cart,
      cartTotal: result?.cartTotal,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to remove course from cart" });
  }
};

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user._id.toString();

    const result = await fetchFromCartUseCase.execute(userId);

    res.status(200).json({
      cart: result?.cart,
      cartTotal: result?.cartTotal,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const getEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user._id.toString();

    const enrolledCourses = await getEnrolledCoursesUseCase.execute(userId);

    res.status(200).json(enrolledCourses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch enrolled courses",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
