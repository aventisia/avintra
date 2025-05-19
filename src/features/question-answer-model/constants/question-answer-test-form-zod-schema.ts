import * as z from "zod";

const questionAnswerSchema = z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
    accuracy: z.number().optional(),
})


export const questionAnswerTestFormZodSchema = z
  .object({
    questionAnswers: z.array(questionAnswerSchema),
})
