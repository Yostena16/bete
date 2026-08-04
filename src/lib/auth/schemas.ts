import { z } from "zod";
import { isValidEthiopianPhone } from "./phone";

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1)
    .refine(isValidEthiopianPhone, { message: "invalidPhone" }),
  password: z.string().min(8, { message: "passwordShort" }),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, { message: "nameShort" }).max(80),
    phone: z
      .string()
      .min(1)
      .refine(isValidEthiopianPhone, { message: "invalidPhone" }),
    password: z.string().min(8, { message: "passwordShort" }).max(72),
    confirmPassword: z.string().min(8),
    intent: z.enum(["seeker", "lister"]),
    listerType: z.enum(["OWNER", "BROKER", "AGENCY"]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.intent === "seeker" || Boolean(data.listerType),
    { message: "listerTypeRequired", path: ["listerType"] },
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
