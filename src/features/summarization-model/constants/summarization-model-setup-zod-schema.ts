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
    
    totalMinimumWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Minimum words") })
    ),
    
    totalMaximumWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Maximum Words") })
    ),
    

    summarizationMethod: z.string(),

    mapIndividualSummaryPrompt: z.string().optional(),
    mapFinalCombinePrompt: z.string().optional(),
    refineSubsequentPrompt: z.string().optional(),
    refineInitialPrompt: z.string().optional(),
    stuffPrompt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const method = data.summarizationMethod;

    if (method === "MapReduce") {
      if (!data.mapIndividualSummaryPrompt || data.mapIndividualSummaryPrompt.trim() === "") {
        ctx.addIssue({
          path: ["mapIndividualSummaryPrompt"],
          message: reqError("Individual Summary Prompt"),
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.mapFinalCombinePrompt || data.mapFinalCombinePrompt.trim() === "") {
        ctx.addIssue({
          path: ["mapFinalCombinePrompt"],
          message: reqError("Final Prompt To Combine"),
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (method === "Refine") {
      if (!data.refineSubsequentPrompt || data.refineSubsequentPrompt.trim() === "") {
        ctx.addIssue({
          path: ["refineSubsequentPrompt"],
          message: reqError("Subsequent Prompt"),
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.refineInitialPrompt || data.refineInitialPrompt.trim() === "") {
        ctx.addIssue({
          path: ["refineInitialPrompt"],
          message: reqError("Initial Prompt"),
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (method === "Stuff") {
      if (!data.stuffPrompt || data.stuffPrompt.trim() === "") {
        ctx.addIssue({
          path: ["stuffPrompt"],
          message: reqError("Prompt"),
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
