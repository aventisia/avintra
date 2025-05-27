import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

export const summarizationModelSetupFormZodSchema = z
  .object({
    context: z.string().min(1, { message: reqError("Context") }),    
    totalMinimumWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Minimum words") })
    ),
    totalMaximumWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Maximum Words") })
    ),
    summarizationMethod: z.string().readonly(),
    stuffPrompt: z.string().min(1, {message: reqError("Prompt")}),
    
  })
