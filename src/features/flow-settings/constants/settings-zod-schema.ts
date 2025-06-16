import { z } from "zod";

export const settingsZodSchema = z.object({
  runDelay: z.number().default(100),
});
