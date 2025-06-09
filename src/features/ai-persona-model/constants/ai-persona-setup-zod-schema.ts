import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

const documentsSchema = z.object({
  name:  z.string().optional(),
  instructions: z.string().optional()
})

export const aiPersonaSetupFormZodSchema = z
  .object({
    name: z.string().min(1, {message: reqError("Persona Name")}),
    roleOrObjective: z.string().min(1, {message: reqError("Role/Objective")}),
    categoryOrDomain: z.string().min(1, {message: reqError("Category/Domain")}),
    toneOfVoice: z.string().min(1, {message: reqError("Tone of voice")}),
    instructions: z.string().min(1, {message: reqError("Instructions")}),
    exclusionsOrBoundaries: z.string().min(1, {message: reqError("Exclusion/Boundaries")}),
    documents: z.array(documentsSchema).nullable(),
    contextMemoryTimeframe: z.string().min(1, {message: reqError("Context Memory")}),
    llm: z.string().min(1, {message: reqError("Model Type")}),
    temperature: z.number().default(0),
    enableAudio: z.boolean().default(false),
    enableVideo: z.boolean().default(false),
    enableChat: z.boolean().default(false),

})
