import { reqError } from "@/react-toolkit/utils/error-message-list";

import * as z from "zod";

export const pwdLoginZodSchema = z.object({
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
  pwd: z.string().min(1, { message: reqError("Password") }),
});
