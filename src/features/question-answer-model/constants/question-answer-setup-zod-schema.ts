import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

export const questionAnswerSchema = z.object({
    question: z.string().min(1, {message: reqError("Question")}),
    instructions: z.string().optional()
})

export const questionAnswerSetupFormZodSchema = z
  .object({
    context: z.string().optional(),
    questions: z.array(questionAnswerSchema),
    nodePrompt: z.string().min(1, {message: reqError("Node Prompt")}),
})
