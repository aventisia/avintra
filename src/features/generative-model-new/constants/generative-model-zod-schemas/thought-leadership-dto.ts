import { llmConfigZodSchema } from "@/features/generative-model/components/llm-configuration/constants/llm-config-zod-schema";
import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

const documentInstructionSchema = z.object({
    id: z.string().readonly(),
    filePath: z.string().readonly(),
    name: z.string().readonly(),
  })
  
const linksSchema = z.object({
    id: z.string().readonly(),
    link: z.string().min(1, {message: reqError("Link")})
})

export const thoughtLeadershipZodSchema = llmConfigZodSchema.extend({
    documentType: z.string().min(1, {message: reqError("Document Type")}),
    topic: z.string().min(1, {message: reqError("Topic")}),
    industry: z.string().min(1, {message: reqError("Industry")}),
    purposeOfArticle: z.string().min(1, {message: reqError("Purpose Of Article")}),
    toneAndStyle: z.string().min(1, {message: reqError("Tone and Style")}),
    targetAudience: z.string().min(1, {message: reqError("Target Audience")}),
    dataAndStats: z.string().min(1, {message: reqError("Data and Stats")}),
    links: z.array(linksSchema),
    documents: z.array(documentInstructionSchema).nullable(),
    outputLength: z.string().min(1, {message: reqError("Output Length")}),
    outputStructure: z.string().min(1, {message: reqError("Output Structure")})
})