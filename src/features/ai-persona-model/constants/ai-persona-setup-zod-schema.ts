import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

const documentInstructionSchema = z.object({
  id: z.string().readonly(),
  filePath: z.string().readonly(),
  name: z.string().readonly(),
  instructions: z.string().optional(),
});

const onPremSpeechConfigSchema = z.object({
  language: z.string().default(""),
  voice: z.string().default(""),
});

const cloudSpeechConfigSchema = z.object({
  language: z.string(),
  voice: z.string(),
  textToSpeech: z.object({
    name: z.string(),
    secret: z.string().nullable(),
  }),
  speechToText: z.object({
    name: z.string(),
    secret: z.string().nullable(),
  }),
});

const speechConfigSchema = z.object({
  configurationType: z.enum(["OnPrem", "Cloud"]).default("OnPrem"),
  onPremConfig: onPremSpeechConfigSchema.nullable(),
  cloudConfig: cloudSpeechConfigSchema.nullable(),
});

const setupObjectSchema = z.object({
  name: z.string().min(1, { message: reqError("Persona Name") }),
  roleOrObjective: z.string().min(1, { message: reqError("Role/Objective") }),
  categoryOrDomain: z.string().min(1, { message: reqError("Category/Domain") }),
  toneOfVoice: z.string().min(1, { message: reqError("Tone of voice") }),
  instructions: z.string().min(1, { message: reqError("Instructions") }),
  exclusionsOrBoundaries: z
    .string()
    .min(1, { message: reqError("Exclusion/Boundaries") }),
  documents: z.array(documentInstructionSchema).nullable(),
  contextMemoryTimeframe: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 2 && num <= 50;
    },
    { message: "Context Memory must be a number between 2 and 50" },
  ),
  speechConfiguration: speechConfigSchema,
});

export const aiPersonaSetupFormZodSchema = z.object({
  id: z.string().readonly(),
  aiPersona: z.object({
    name: z.string().readonly().default("AIPersona"),
    model: z
      .string()
      .min(1, { message: reqError("Base LLM") })
      .default("gemma"),
    nodePrompt: z.string().min(1, { message: reqError("Node Prompt") }),
    temperature: z.number().default(0.7),
    setupObject: setupObjectSchema,
  }),
});
