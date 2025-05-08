import mongoose, { Schema, model } from "mongoose";
import { ICertificate } from "../../domain/entities/Certificate";

const certificateSchema = new Schema<ICertificate>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    courseId: {
      type: String,
      required: true,
      ref: "Course",
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CertificateModel =
  mongoose.models.Certificate ||
  model<ICertificate>("Certificate", certificateSchema);

export default CertificateModel;
