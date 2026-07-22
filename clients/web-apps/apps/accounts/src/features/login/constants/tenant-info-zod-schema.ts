import * as z from "zod";

import { reqError } from "@/react-toolkit/utils/error-message-list";

export const tenantInfoZodSchema = z.object({
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
});
