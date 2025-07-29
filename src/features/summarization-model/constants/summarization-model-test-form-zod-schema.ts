import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";


export const summarizationModelTestFormZodSchema = z
  .object({
    summarizedText: z.string().min(1, { message: reqError("Summarized Text") }),
})
