"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { updateUserProfile } from "@/lib/user/profile";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.union([z.null(), z.string().email()])),
  listerType: z
    .enum(["OWNER", "BROKER", "AGENCY"])
    .nullable()
    .optional()
    .transform((value) => value ?? null),
});

export async function updateProfileAction(input: {
  name: string;
  email?: string;
  listerType?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthenticated" };
  }

  const parsed = profileSchema.safeParse({
    name: input.name,
    email: input.email ?? "",
    listerType: input.listerType || null,
  });
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const result = await updateUserProfile(session.user.id, {
    name: parsed.data.name,
    email: parsed.data.email,
    listerType: parsed.data.listerType,
  });

  if (!result.ok) return result;

  revalidatePath("/dashboard");
  revalidatePath("/[locale]/dashboard", "page");
  return { ok: true };
}
