import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const promptZodSchema = z.object({
  userPrompt: z.string().min(1, { message: reqError("User Prompt") }),
  systemPrompt: z.string().min(1, { message: reqError("System Prompt") }),
});
