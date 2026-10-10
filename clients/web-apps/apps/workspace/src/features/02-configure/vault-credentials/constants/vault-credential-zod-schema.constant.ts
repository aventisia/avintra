import { flexibleNameError, flexibleNameRegex, maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a config name.
 */
export const vaultCredentialNameSchema = z
  .string()
  .min(1, { message: reqError("Credential name") })
  .max(255, { message: maxLenError("Credential name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Credential name"),
  });

/**
 * Represents the Zod schema for a Credential.
 */
export const vaultCredentialZodSchema = z
  .object({
    id: z.string(),
    name: vaultCredentialNameSchema,
    username: z.string().min(1, { message: reqError("User name") }),
    password: z.string().min(1, { message: reqError("Password") }),
    confirmPassword: z.string().min(1, { message: reqError("Confirm password") }),
    description: z.string().optional(),

    isDisabled: z.boolean().default(false),
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
