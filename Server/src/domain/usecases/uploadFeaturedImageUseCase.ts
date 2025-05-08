import { IUploadService } from "../../infrastructure/services/cloudinaryService";

export class UploadFeaturedImageUsecase {
  constructor(private imageUploadService: IUploadService) {}

  execute = async (filePath: string): Promise<string> => {
    try {
      if (!filePath) {
        throw new Error("File path is required");
      }
      const uploadResult = await this.imageUploadService.uploadFile(filePath, {
        folder: "featured_image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
        ],
        resourceType: "image",
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
