import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

const outputSchema = z.object({
  value: z.string(),
  enabled: z.boolean().default(true),
});

export const llmConfigZodSchema = z.object({
  input: z.string().min(1, { message: reqError("Prompt") }),
  provider: z.string().min(1, { message: reqError("LLM Provider") }),
  model: z.string().min(1, { message: reqError("Model") }),
  is_byok_enabled: z.boolean(),
  credential_id: z.string().optional(),
  temperature: z.number().min(0).max(1.2),
  top_p: z.number().min(0).max(1.2),
  AIModelResult: outputSchema,
});
