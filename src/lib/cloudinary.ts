import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function ensureConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export type UploadedImage = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
};

/**
 * Server-side upload. The browser compresses first; we still bound the payload
 * so a misbehaving client cannot flood the account.
 */
export async function uploadListingImage(
  buffer: Buffer,
  folder = "bete/listings",
): Promise<UploadedImage> {
  ensureConfigured();

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          format: "webp",
          transformation: [
            { width: 1600, height: 1600, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, uploaded) => {
          if (error || !uploaded) {
            reject(error ?? new Error("Upload failed"));
            return;
          }
          resolve(uploaded);
        },
      )
      .end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}
