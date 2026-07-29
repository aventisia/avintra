import { z } from "zod";

export const skillAddFilesSchema = z.object({
  fileDescription: z.string().optional(),
});
