import * as z from "zod";
import {
  reqError,
} from "@/react-toolkit/components/form";

export const tenantInfoZodSchema = z.object({
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
});


