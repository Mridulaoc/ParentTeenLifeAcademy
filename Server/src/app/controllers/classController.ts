import { Request, Response } from "express";
import { ClassRepository } from "../../domain/repositories/classRepository";
import { ScheduleClassUseCase } from "../../domain/usecases/scheduleClassUseCase";
import { v4 as uuidv4 } from "uuid";
import { FetchClassUseCase } from "../../domain/usecases/fetchClassUseCase";

const classRepository = new ClassRepository();
const scheduleClassUseCase = new ScheduleClassUseCase(classRepository);
const fetchClassUseCase = new FetchClassUseCase(classRepository);

export const scheduleClass = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, dayOfWeek, startTime, duration } = req.body;

    if (!title || !description || !dayOfWeek || !startTime || !duration) {
      res.status(400).json({
        message: "Missing required fields",
      });
    }
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (!daysOfWeek.includes(dayOfWeek)) {
      throw new Error("Invalide day of the week");
    }
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime)) {
      throw new Error("Invalid time format");
    }
    if (isNaN(duration) || duration <= 0) {
      throw new Error("Duration must be greater than 0");
    }
    const roomId = uuidv4();
    const result = await scheduleClassUseCase.execute({
      title,
      description,
      dayOfWeek,
      startTime,
      duration: Number(duration),
      isRecurring: true,
      roomId,
    });

    res.status(200).json({ message: "Class scheduled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const classData = await fetchClassUseCase.execute();
    if (!classData) {
      res.status(404).json({ message: "Class not found" });
      return;
    }
    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching class" });
  }
};
