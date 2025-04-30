import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

export const emailSchema = z
  .string()
  .min(1, { message: reqError("Email") })
  .email();

export const updateEmailZodSchema = z.object({
  email: emailSchema,
});
