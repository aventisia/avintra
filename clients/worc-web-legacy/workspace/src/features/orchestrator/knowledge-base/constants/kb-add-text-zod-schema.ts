import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const kbAddTextSchema = z.object({
  textContent: z.string().min(1, { message: reqError("Text Content") }),

  chunkSize: z.coerce
    .number({
      invalid_type_error: "Must be a number",
    })
    .min(1, { message: "Minimum 1 chunk required" })
    .max(100, { message: "Maximum 100 chunks allowed" }),
  chunkOverlap: z.coerce
    .number({
      invalid_type_error: "Must be a number",
    })
    .min(1, { message: "Minimum 1 chunk required" })
    .max(100, { message: "Maximum 100 chunks allowed" }),
});
