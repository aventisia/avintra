import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

export const summarizationModelSetupFormZodSchema = z
  .object({
    context: z.string().min(1, { message: reqError("Context") }),
    charactersPerChunk: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Characters Per Chunk") })
    ),
    
    chunkOverlap: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Chunk Overlap") })
    ),
    
    totalMinWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Minimum words") })
    ),
    
    totalMaxWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Maximum Words") })
    ),
    

    summarizationMethod: z.string(),

    individualSummaryPrompt: z.string().optional(),
    finalPromptToCombine: z.string().optional(),
    subsequentPrompt: z.string().optional(),
    initialPrompt: z.string().optional(),
    prompt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const method = data.summarizationMethod;

    if (method === "mapReduce") {
      if (!data.individualSummaryPrompt || data.individualSummaryPrompt.trim() === "") {
        ctx.addIssue({
          path: ["individualSummaryPrompt"],
          message: reqError("Individual Summary Prompt"),
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.finalPromptToCombine || data.finalPromptToCombine.trim() === "") {
        ctx.addIssue({
          path: ["finalPromptToCombine"],
          message: reqError("Final Prompt To Combine"),
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (method === "refine") {
      if (!data.subsequentPrompt || data.subsequentPrompt.trim() === "") {
        ctx.addIssue({
          path: ["subsequentPrompt"],
          message: reqError("Subsequent Prompt"),
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.initialPrompt || data.initialPrompt.trim() === "") {
        ctx.addIssue({
          path: ["initialPrompt"],
          message: reqError("Initial Prompt"),
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (method === "stuff") {
      if (!data.prompt || data.prompt.trim() === "") {
        ctx.addIssue({
          path: ["prompt"],
          message: reqError("Prompt"),
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
