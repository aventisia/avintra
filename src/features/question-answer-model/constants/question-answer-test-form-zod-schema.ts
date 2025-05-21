import * as z from "zod";

const questionAnswerSchema = z.object({
    name: z.string().optional(),
    instructions: z.string().optional(),
    accuracy: z.number().optional(),
})


export const questionAnswerTestFormZodSchema = z
  .object({
    questionAnswers: z.array(questionAnswerSchema),
    submitForFineTuning: z.boolean()
})
