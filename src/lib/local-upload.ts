import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { UploadedImage } from "@/lib/cloudinary";

/**
 * Dev / no-Cloudinary fallback. Files land under public/uploads so the same
 * URL works in <img> and next/image without a remote host.
 */
export async function saveListingImageLocally(
  buffer: Buffer,
): Promise<UploadedImage> {
  const id = randomUUID();
  const filename = `${id}.webp`;
  const dir = path.join(process.cwd(), "public", "uploads", "listings");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return {
    url: `/uploads/listings/${filename}`,
    publicId: `local/listings/${id}`,
  };
}
