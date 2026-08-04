import { compare, hash } from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}

/** Shared by the seed so every demo account uses the same known password. */
export const DEMO_PASSWORD = "bete-demo-2026";
