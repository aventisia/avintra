// import { reqError } from "@avplatform/ui/utils";
import { z } from "zod";

export const emailSchema = z
  .string()
  // .min(1, { message: reqError("Email") })
  .email();

export const updateEmailZodSchema = z.object({
  email: emailSchema,
});
