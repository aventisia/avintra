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

export const companyDeepDivesZodSchema = llmConfigZodSchema.extend({
    companyName: z.string().min(1, {message: reqError("Company Name")}),
    websiteLink: z.string().min(1, {message: reqError("Website Link")}),
    focusAreas: z.string().min(1, {message: reqError("Focus Area")}),
    webData: z.string().min(1, {message: reqError("Web Data")}),
    links: z.array(linksSchema),
    documents: z.array(documentInstructionSchema).nullable(),
    summaryDepth: z.string().min(1, {message: reqError("Summary Depth")}),
})