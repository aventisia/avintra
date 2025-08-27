import { llmConfigZodSchema } from "@/features/llm-configuration/constants/llm-config-zod-schema";

import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

export const questionAnswerSchema = z.object({
  name: z.string().min(1, { message: reqError("Question") }),
  instructions: z.string().optional(),
});

export const questionAnswerSetupFormZodSchema = llmConfigZodSchema.extend({
  id: z.string().readonly(),
  name: z.string().readonly().default("Question Answer"),
  setupObject: z.object({
    questionAnswers: z.array(questionAnswerSchema),
  }),
});
