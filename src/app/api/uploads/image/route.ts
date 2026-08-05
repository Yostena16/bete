import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  isCloudinaryConfigured,
  uploadListingImage,
} from "@/lib/cloudinary";
import { saveListingImageLocally } from "@/lib/local-upload";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB after client compression

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missingFile" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "notImage" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "tooLarge" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploaded = isCloudinaryConfigured()
      ? await uploadListingImage(buffer)
      : await saveListingImageLocally(buffer);
    return NextResponse.json({ ok: true, ...uploaded });
  } catch {
    return NextResponse.json({ error: "uploadFailed" }, { status: 500 });
  }
}
