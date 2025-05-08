import { IUploadService } from "../../infrastructure/services/cloudinaryService";

export class UploadIntroVideoUsecase {
  constructor(private videoUploadService: IUploadService) {}
  execute = async (filePath: string): Promise<string> => {
    try {
      if (!filePath) {
        throw new Error("File path is required");
      }
      const uploadResult = await this.videoUploadService.uploadFile(filePath, {
        folder: "featured_image",
        transformation: [
          { width: 1280, height: 720, crop: "limit" },
          { quality: "auto" },
        ],
        resourceType: "video",
      });
      return uploadResult.url;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "Some error occurred";
    }
  };
}
