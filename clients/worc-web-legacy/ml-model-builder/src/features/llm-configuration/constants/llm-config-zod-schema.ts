import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const llmConfigZodSchema = z.object({
  configurationType: z.string().readonly().default("OnPrem"),
  llm: z
    .string()
    .min(1, { message: reqError("Base LLM") })
    .default(import.meta.env.MODE !== "production" ? "gemma" : "gpt-4o-mini"),
  nodePrompt: z.string().min(1, { message: reqError("Node Prompt") }),
  temperature: z.number().default(0.2),
});
