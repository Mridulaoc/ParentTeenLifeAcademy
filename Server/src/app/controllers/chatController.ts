import { Request, Response } from "express";
import { ChatRepository } from "../../domain/repositories/chatRepository";
import { GetAdminChatsUseCase } from "../../domain/usecases/getAdminChatsUsecase";
import { GetChatUseCase } from "../../domain/usecases/getChatByIdUsecase";
import { IUser } from "../../domain/entities/User";

import { SendMessageUseCase } from "../../domain/usecases/sendMessageUseCase";
import { IAdmin } from "../../domain/entities/Admin";
import { GetStudentsChatsUseCase } from "../../domain/usecases/getStudentsChatsUseCase";
import { AdminRepository } from "../../domain/repositories/adminRepository";
import { GetAdminIdUseCase } from "../../domain/usecases/getAdminIdUseCase";
import { error } from "console";
import { CreateChatUseCase } from "../../domain/usecases/createChatUseCase";
import { CreateOrGetChatUseCase } from "../../domain/usecases/createOrGetChatUseCase";
import { MarkMessagesAsReadUseCase } from "../../domain/usecases/markMessagesAsReadUseCase";

const chatRpository = new ChatRepository();
const adminRepository = new AdminRepository();
const getAdminChatsUseCase = new GetAdminChatsUseCase(chatRpository);
const getChatUseCase = new GetChatUseCase(chatRpository);
const createOrGetChatUseCase = new CreateOrGetChatUseCase(chatRpository);
const createChatUseCase = new CreateChatUseCase(chatRpository);
const sendMessageUseCase = new SendMessageUseCase(chatRpository);
const getSudentChatsUseCase = new GetStudentsChatsUseCase(chatRpository);
const getAdminIdusecase = new GetAdminIdUseCase(adminRepository);
const markMessageAsReadUseCase = new MarkMessagesAsReadUseCase(chatRpository);

interface RequestWithAdmin extends Request {
  admin?: IAdmin;
}
export const getAdminChats = async (
  req: RequestWithAdmin,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.admin?._id.toString();
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const chats = await getAdminChatsUseCase.execute(adminId);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;

    const chat = await getChatUseCase.execute(chatId);
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.body;
    const admin = req.admin;
    if (!admin) {
      throw new Error("Admin id is required");
    }
    const adminId = admin._id;
    const chat = await createChatUseCase.execute(studentId, adminId.toString());
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrCreateChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { adminId } = req.body;
    const user = req.user as IUser;
    const studentId = user._id.toString();

    const chat = await createOrGetChatUseCase.execute(studentId, adminId);
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = await getAdminIdusecase.execute();

    res.status(200).json({ adminId });
  } catch (error) {
    console.error("Error in getAdminId controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const studentId = user._id.toString();
    const chats = await getSudentChatsUseCase.execute(studentId);

    if (!chats) {
      res.status(404).json({ message: "Chats not found" });
      return;
    }

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
