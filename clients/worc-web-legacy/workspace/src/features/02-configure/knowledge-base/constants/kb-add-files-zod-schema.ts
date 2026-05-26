import { z } from "zod";

export const kbAddFilesSchema = z
  .object({
    chunkSize: z.coerce
      .number({
        invalid_type_error: "Must be a number",
      })
      .min(50, { message: "Minimum chunk size is 50" })
      .max(8000, { message: "Maximum chunk size is 8000" }),

    chunkOverlap: z.coerce
      .number({
        invalid_type_error: "Must be a number",
      })
      .min(0, { message: "Minimum overlap is 0" }),
  })
  .superRefine((data, ctx) => {
    const maxAllowedOverlap = Math.floor(data.chunkSize * 0.2);

    if (data.chunkOverlap > maxAllowedOverlap) {
      ctx.addIssue({
        path: ["chunkOverlap"],
        code: z.ZodIssueCode.custom,
        message: `Overlap cannot exceed 20% of chunk size`,
      });
    }
  });
