import * as z from "zod";

export const questionAnswerTestFormZodSchema = z.array(
  z.object({
    question: z.string().default(""),
    answer: z.string().default(""),
    confidenceScore: z.string().default(""),
  }),
);
