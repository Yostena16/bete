import { prisma } from "@/lib/db";
import type { ListerType } from "@/generated/prisma/enums";

export type UserProfile = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  listerType: ListerType | null;
  role: string;
};

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      listerType: true,
      role: true,
    },
  });
}

export async function updateUserProfile(
  userId: string,
  data: {
    name: string;
    email: string | null;
    listerType: ListerType | null;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (data.email) {
    const taken = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id: userId },
      },
      select: { id: true },
    });
    if (taken) return { ok: false, error: "emailTaken" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      listerType: data.listerType,
    },
  });

  return { ok: true };
}
