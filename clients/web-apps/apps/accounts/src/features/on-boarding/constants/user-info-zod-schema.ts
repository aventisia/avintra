import { nameError, reqError } from "@avplatform/ui/utils";
import { nameRegex } from "@avplatform/ui/utils";
import { z } from "zod";

export const userInfoSchema = z.object({
  country: z
    .string()
    .min(1, reqError("Country"))
    .regex(nameRegex, {
      message: nameError("Country"),
    }),
});
