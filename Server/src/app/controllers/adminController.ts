import { AdminLoginUseCase } from "../../domain/usecases/adminLoginUseCases";
import { Request, Response } from "express";
import { AdminRepository } from "../../domain/repositories/adminRepository";
import { FetchUsersUseCase } from "../../domain/usecases/fetchUsersUseCase";
import { UserRepository } from "../../domain/repositories/userRepository";
import { ToggleBlockUserUseCase } from "../../domain/usecases/toggleBlockUseCase";
import { CategoryRepository } from "../../domain/repositories/categoryRepository";
import { FetchCategoriesUseCase } from "../../domain/usecases/fetchCategoriesUseCase";
import { AddCategoryUseCase } from "../../domain/usecases/addCategoryUseCase";
import { GetCategoryUseCase } from "../../domain/usecases/getCategoryUseCase";
import { EditCategoryUseCase } from "../../domain/usecases/editCategoryUseCase";
import { DeleteCategoryUseCase } from "../../domain/usecases/deleteCategoryUseCase";

const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const adminLoginUseCase = new AdminLoginUseCase(adminRepository);
const fetchUsersUseCase = new FetchUsersUseCase(adminRepository);
const toggleBlockUserUseCase = new ToggleBlockUserUseCase(userRepository);
const fetchCategoryUseCase = new FetchCategoriesUseCase(categoryRepository);
const addCategoryUseCase = new AddCategoryUseCase(categoryRepository);
const getCategoryUseCase = new GetCategoryUseCase(categoryRepository);
const editCategoryUseCase = new EditCategoryUseCase(categoryRepository);
const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { message, adminId, token } = await adminLoginUseCase.execute(
      email,
      password
    );

    res.status(200).json({ message, adminId, token });
  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const { users, total } = await fetchUsersUseCase.execute(page, limit);
    res.status(200).json({ users, total, page, limit });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const toggleBlockUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const updatedUser = await toggleBlockUserUseCase.execute(userId);
    if (updatedUser) {
      const id = updatedUser._id.toString();
      const isBlocked = updatedUser.isBlocked;
      res.status(200).json({ message: "User Blocked", id, isBlocked });
    }
  } catch (error) {
    res.status(500).json({ message: "Error blocking user" });
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await fetchCategoryUseCase.execute();
    if (result.categories.length === 0) {
      res.status(404).json({ message: result.message });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(404).json({ message: "Name and description are required" });
      return;
    }
    const newCategory = await addCategoryUseCase.execute({
      name,
      description,
      isDeleted: false,
    });
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "A category with the same name already exists."
    ) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Error creating category" });
  }
};

export const getCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await getCategoryUseCase.execute(id);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category" });
  }
};

export const editCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedCategory = await editCategoryUseCase.execute(
      id,
      name,
      description
    );
    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category not found") {
        res.status(404).json({ message: error.message });
      } else if (
        error.message === "A category with the same name already exists."
      ) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error updating category" });
      }
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryId = req.params.id;
    const { isDeleted } = req.body;
    const result = await deleteCategoryUseCase.execute(categoryId, !isDeleted);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
