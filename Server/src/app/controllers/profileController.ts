import { Request, Response } from "express";
import fs from "fs";
import { UpdateUserProfileUseCase } from "../../domain/usecases/updateUserProfileUseCase";
import { GetUserUseCase } from "../../domain/usecases/getUserUseCase";
import { UserRepository } from "../../domain/repositories/userRepository";
import { ObjectId } from "mongodb";
import { IUser } from "../../domain/entities/User";
import { UploadProfileImageUsease } from "../../domain/usecases/uploadProfileImageUseCase";
import { CloudinaryUploadService } from "../../infrastructure/services/cloudinaryService";

const userRepository = new UserRepository();
const uploadService = new CloudinaryUploadService();
const getUserUseCase = new GetUserUseCase(userRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
const uploadProfileImageUseCase = new UploadProfileImageUsease(
  userRepository,
  uploadService
);

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const existingUser = await getUserUseCase.execute(user._id.toString());
    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(existingUser);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (
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
    const updateData = req.body;

    const existingUser = await updateUserProfileUseCase.execute(
      userId,
      updateData
    );
    res.json(existingUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadProfileImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;

    if (!user || !user._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const profileImageUrl = await uploadProfileImageUseCase.execute(
      user._id.toString(),
      req.file.path
    );
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    res.status(200).json({
      message: "Profile image uploaded successfully",
      profileImageUrl,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);

    if (error instanceof Error) {
      res.status(500).json({
        message: error.message || "Failed to upload profile image",
      });
    }

    res.status(500).json({ message: "Failed to upload profile image" });
  }
};
