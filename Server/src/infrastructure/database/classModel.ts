import { model, Schema } from "mongoose";
import { IClass } from "../../domain/entities/Class";

const classSchema = new Schema<IClass>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true },
    isRecurring: { type: Boolean, default: true },
    roomId: { type: String, unique: true, required: true },
    nextOccurrence: { type: Date },
  },
  { timestamps: true }
);

export const ClassModel = model<IClass>("Class", classSchema);
