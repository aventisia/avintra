import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

export const questionAnswerSchema = z.object({
    name: z.string().min(1, {message: reqError("Question")}),
    instructions: z.string().optional()
})

export const questionAnswerSetupFormZodSchema = z
  .object({
    context: z.string().min(1, {message: reqError("Context")}),
    questionAnswers: z.array(questionAnswerSchema),
    prompt: z.string().min(1, {message: reqError("Prompt")}),
})
