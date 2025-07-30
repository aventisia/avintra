import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

const documentInstructionSchema = z.object({
  id: z.string().readonly(),
  filePath: z.string().readonly(),
  name: z.string().readonly(),
  instructions: z.string().optional(),
})

const speechConfigSchema = z.object({
    configurationType: z.enum(["OnPrem", "Cloud"]).default("OnPrem"),
    language: z.string(),
    voices: z.string(),
    textToSpeech: z.string(),
    speechToText: z.string(),
})

const setupObjectSchema = z.object({
  name: z.string().min(1, {message: reqError("Persona Name")}),
  roleOrObjective: z.string().min(1, {message: reqError("Role/Objective")}),
  categoryOrDomain: z.string().min(1, {message: reqError("Category/Domain")}),
  toneOfVoice: z.string().min(1, {message: reqError("Tone of voice")}),
  instructions: z.string().min(1, {message: reqError("Instructions")}),
  exclusionsOrBoundaries: z.string().min(1, {message: reqError("Exclusion/Boundaries")}),
  documents: z.array(documentInstructionSchema).nullable(),
  contextMemoryTimeframe: z.string().min(1, {message: reqError("Context Memory")}),
  speechConfiguration: speechConfigSchema
})

export const aiPersonaSetupFormZodSchema = z
  .object({
    id: z.string().readonly(),
    aiPersona: z.object({
      name: z.string().readonly().default("AIPersona"),
      configurationType: z.enum(["OnPrem", "Cloud"]).default("OnPrem"),
      llm: z.string().min(1, {message: reqError("Base LLM")}).default("gemma"),
      nodePrompt: z.string().min(1, {message: reqError("Node Prompt")}),
      temperature: z.number().default(0.7),
      setupObject: setupObjectSchema
    }),
})
