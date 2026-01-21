import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const llmConfigZodSchema = z.object({
  model: z
    .string()
    .min(1, { message: reqError("Model") })
    .default("gpt-4o-mini"),
  nodePrompt: z.string().min(1, { message: reqError("Node Prompt") }),
  temperature: z.number().default(0.2),
  topP: z.number().default(0.2),
  credentialId: z.string().nullable().optional(),
  provider: z
    .string()
    .min(1, { message: reqError("Provider") })
    .default("openai"),
  isBYOKEnabled: z.boolean().default(false),
  isJsonOutput: z.boolean().default(false),
  maxOutputToken: z.number().default(50),
});
