import {
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod schema for On Prem LLM.
 */
export const onPremLLMZodSchema = z.object({
  id: z.string(),
  llm: z.string().min(1, {message: reqError("LLM Name")}),
  displayName: z.string().min(1, {message: reqError("Display Name")}),
  description: z.string(),
  status: z.string().readonly(),
});
