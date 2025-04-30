import { reqError } from "@/react-toolkit/utils/error-message-list";

import * as z from "zod";

export const tenantInfoZodSchema = z.object({
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
});
