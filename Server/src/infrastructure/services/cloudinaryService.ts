import cloudinary from "../../config/cloudinaryConfig";

export interface uploadResult {
  url: string;
  publicId?: string;
}
export interface IUploadOptions {
  folder?: string;
  transformation?: Array<Record<string, unknown>>;
  resourceType?: "image" | "video";
}

export interface IUploadService {
  uploadFile(filePath: string, options?: IUploadOptions): Promise<uploadResult>;
}

export class CloudinaryUploadService implements IUploadService {
  async uploadFile(
    filePath: string,
    options?: IUploadOptions
  ): Promise<uploadResult> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: options?.folder || "default",
        transformation: options?.transformation,
        resource_type: options?.resourceType || "image",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Failed to upload image");
    }
  }
}
