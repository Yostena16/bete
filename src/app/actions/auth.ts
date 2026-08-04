"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEthiopianPhone } from "@/lib/auth/phone";
import { loginSchema, registerSchema } from "@/lib/auth/schemas";

export type AuthActionState = {
  ok: boolean;
  error?: string;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }

  const phone = normalizeEthiopianPhone(parsed.data.phone)!;
  const callbackUrl = String(formData.get("callbackUrl") || "/dashboard");

  try {
    await signIn("credentials", {
      phone,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "invalidCredentials" };
    }
    throw error;
  }
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    intent: formData.get("intent"),
    listerType: formData.get("listerType") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }

  const phone = normalizeEthiopianPhone(parsed.data.phone)!;
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return { ok: false, error: "phoneTaken" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const role = parsed.data.intent === "lister" ? "LISTER" : "SEEKER";

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      phone,
      passwordHash,
      role,
      listerType:
        role === "LISTER" ? (parsed.data.listerType ?? null) : null,
      phoneVerified: false,
    },
  });

  try {
    await signIn("credentials", {
      phone,
      password: parsed.data.password,
      redirectTo: role === "LISTER" ? "/post" : "/rent",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "invalidCredentials" };
    }
    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/" });
}
