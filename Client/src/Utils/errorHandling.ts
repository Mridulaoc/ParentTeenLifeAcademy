import axios from "axios";

export const handleAsyncThunkError = (error: unknown): { message: string } => {
  let errorMessage: string;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === "object" && data !== null && "message" in data) {
        errorMessage = data.message as string;
      } else if (typeof data === "string") {
        errorMessage = data;
      } else if (typeof data === "object" && data !== null && "error" in data) {
        errorMessage = (data.error as string) || "Server error";
      } else {
        errorMessage = "Server error";
      }
    } else {
      errorMessage = error.message || "Server error";
    }
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = "An unknown error occurred";
  }

  return { message: errorMessage };
};
