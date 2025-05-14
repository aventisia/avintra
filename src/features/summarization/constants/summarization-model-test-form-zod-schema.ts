import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";


export const summarizationModelTestFormZodSchema = z
  .object({
    summarizedText: z.string().min(1, { message: reqError("Summarized Text") }),
    totalMinWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Minimum words") })
    ),
        
    totalMaxWords: z.preprocess(
      (val) => Number(val),
      z.number().min(1, { message: reqError("Total Maximum Words") })
    ),
})
