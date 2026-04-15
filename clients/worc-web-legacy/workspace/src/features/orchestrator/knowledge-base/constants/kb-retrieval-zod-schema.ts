import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const knowledgeBaseRetrievalSchema = z.object({
  query: z.string().min(1, { message: reqError("Query") }),

  numberOfChunks: z.coerce
    .number({
      invalid_type_error: "Must be a number",
    })
    .min(50, { message: "Minimum 50 chunk required" })
    .max(8000, { message: "Maximum 8000 chunks allowed" }),
  retrievalType: z.string().min(1, {
    message: reqError("Retrieval type"),
  }),

  scoreThreshold: z
    .number()
    .min(0, { message: "Minimum is 0.0" })
    .max(1.2, { message: "Maximum is 1.2" }),
});
