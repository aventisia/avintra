import { reqError } from "@avplatform/ui/utils";
import * as z from "zod";

export const tenantInfoZodSchema = z.object({
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
});
