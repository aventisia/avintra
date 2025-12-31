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
  clientName: z.string().min(1, { message: reqError("Client / Bidder Name") }),
  websiteLink: z
    .string()
    .min(1, { message: reqError("Client / Bidder Website Link") }),
  rpfDocument: z.array(documentInstructionSchema).nullable(),
  responseStrategy: z
    .string()
    .min(1, { message: reqError("Response Strategy") }),
  responseBoundary: z
    .string()
    .min(1, { message: reqError("Response Boundaries") }),
  links: z.array(linksSchema),
  preferDocument: z.array(documentInstructionSchema).nullable(),
});

const generativeModelSchema = llmConfigZodSchema.extend({
  name: z.string().readonly().default("RFPResponseGenerator"),
  setupObject: setupObjectSchema,
});

export const rfpRpiResponseGeneratorZodSchema = z.object({
  id: z.string().readonly(),
  generativeModel: generativeModelSchema,
});
