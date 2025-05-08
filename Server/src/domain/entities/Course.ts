import { ObjectId } from "mongodb";
import mongoose from "mongoose";

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}
interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export interface ICourse {
  title: string;
  description: string;
  visibility: "public" | "private";
  category: mongoose.Types.ObjectId;
  price: number;
  featuredImage?: string;
  introVideoUrl?: string;
  whatYouWillLearn: string;
  targetAudience: string;
  durationHours: number;
  durationMinutes: number;
  lessons: mongoose.Types.ObjectId[] | string[];
  studentsEnrolled: mongoose.Types.ObjectId[] | string[];
  reviewStats?: ReviewStats;
}
