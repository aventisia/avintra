import { llmConfigZodSchema } from "@/features/llm-configuration/constants/llm-config-zod-schema";

import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

export const summarizationModelSetupFormZodSchema = llmConfigZodSchema.extend({
  id: z.string().readonly(),
  name: z.string().readonly().default("Summarization"),
  setupObject: z.object({
    totalMinimumWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Minimum words") }),
    ),
    totalMaximumWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Maximum Words") }),
    ),
    summarizationMethod: z.string().readonly().default("stuff"),
  }),
});
