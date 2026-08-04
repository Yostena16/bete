import type { DefaultSession } from "next-auth";
import type { ListerType, Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      phone: string;
      listerType: ListerType | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    phone: string;
    listerType: ListerType | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    phone: string;
    listerType: ListerType | null;
  }
}
