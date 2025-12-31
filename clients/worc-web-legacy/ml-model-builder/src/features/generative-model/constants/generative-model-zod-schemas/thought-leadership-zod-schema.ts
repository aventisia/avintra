import { llmConfigZodSchema } from "@/features/generative-model/components/llm-configuration/constants/llm-config-zod-schema";

import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

const documentInstructionSchema = z.object({
  id: z.string().readonly(),
  path: z.string().readonly(),
  name: z.string().readonly(),
});

const linksSchema = z.object({
  id: z.string().readonly().optional(),
  url: z.string().min(1, { message: reqError("Link") }),
});

const setupObjectSchema = z.object({
  documentType: z.string().min(1, { message: reqError("Document Type") }),
  topic: z.string().min(1, { message: reqError("Topic") }),
  industry: z.string().min(1, { message: reqError("Industry") }),
  purpose: z.string().min(1, { message: reqError("Purpose Of Article") }),
  toneStyle: z.string().min(1, { message: reqError("Tone and Style") }),
  audienceTarget: z.string().min(1, { message: reqError("Target Audience") }),
  dataAndStats: z.string().min(1, { message: reqError("Data and Stats") }),
  links: z.array(linksSchema),
  documents: z.array(documentInstructionSchema).nullable(),
  contentLength: z.string().min(1, { message: reqError("Output Length") }),
  contentStructure: z
    .string()
    .min(1, { message: reqError("Output Structure") }),
});

const generativeModelSchema = llmConfigZodSchema.extend({
  name: z.string().readonly().default("ThoughtLeadership"),
  setupObject: setupObjectSchema,
});

export const thoughtLeadershipZodSchema = z.object({
  id: z.string().readonly(),
  generativeModel: generativeModelSchema,
});
