import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const llmConfigZodSchema = z.object({
  llmProvider: z.string().min(1, { message: reqError("LLM Provider") }),
  model: z.string().min(1, { message: reqError("Model") }),
  hasOwnApiKey: z.boolean(),
  credentials: z.string().optional(),
  temperature: z.number().min(0).max(1.2),
  topP: z.number().min(0).max(1.2),
});
