import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export interface CloudinaryUploadOptions {
  folder?: string;
  format?: string;
  public_id?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  overwrite?: boolean;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  asset_id?: string;  // optional — not always returned
  created_at: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const {
      folder = "creator-hub",
      format,
      public_id,
      resource_type = "image",
      overwrite = false,
    } = options;

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, format, public_id, resource_type, overwrite, use_filename: true, unique_filename: !public_id },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Empty Cloudinary result"));
        // Cast through unknown to avoid strict overlap check
        resolve(result as unknown as CloudinaryUploadResult);
      }
    );
    uploadStream.end(buffer);
  });
}

export default cloudinary;
