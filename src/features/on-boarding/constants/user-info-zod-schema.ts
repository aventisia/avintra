import { nameError, reqError } from "@/react-toolkit/utils/error-message-list";
import { nameRegex } from "@/react-toolkit/utils/regex-list";

import { z } from "zod";

export const userInfoSchema = z.object({
  country: z
    .string()
    .min(1, reqError("Country"))
    .regex(nameRegex, {
      message: nameError("Country"),
    }),
});
