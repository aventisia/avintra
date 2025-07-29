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
  

export const rfpRpiResponseGeneratorZodSchema = llmConfigZodSchema.extend({
    clientName:  z.string().min(1, {message: reqError("Client Name")}),
    clientLink:  z.string().min(1, {message: reqError("Client Link")}),
    rfiRfpDocuments: z.array(documentInstructionSchema).nullable(),
    responseStrategy: z.string().min(1, {message: reqError("Response Strategy")}),
    links: z.array(linksSchema),
    responseBoundaries: z.string().min(1, {message: reqError("Response Boundaries")}),
    referenceDocuments: z.array(documentInstructionSchema).nullable(),
})