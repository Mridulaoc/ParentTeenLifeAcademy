import mongoose, { ConnectOptions } from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri: string = process.env.MONGO_URI || "";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log("Connected to Mongodb Atlas");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};
