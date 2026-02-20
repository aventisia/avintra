import { z } from "zod";

export const UserProfileZodSchema = z.object({
  firstName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  // dateOfBirth: z.optional(z.date()).nullable(),
  phoneNumber: z.optional(z.string()),
  // addressLine1: z.optional(z.string()),
  // addressLine2: z.optional(z.string()),
  // gender: z.optional(z.enum(["Male", "Female", "PreferNotToSay"])),
  country: z.optional(z.string()).nullable(),
  // city: z.optional(z.string()),
  // stateOrProvince: z.optional(z.string()),
  // zipOrPostalCode: z.optional(z.string()),
});
