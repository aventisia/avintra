import { llmConfigZodSchema } from "@/features/generative-model/components/llm-configuration/constants/llm-config-zod-schema";
import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

const linksSchema = z.object({
    id: z.string().readonly(),
    link: z.string().min(1, {message: reqError("Link")})
})

export const personaResearchZodSchema = llmConfigZodSchema.extend({
    taskName: z.string().readonly(),
    personaName: z.string().min(1, {message: reqError("Persona Name")}),
    companyName: z.string().min(1, {message: reqError("Company Name")}),
    referenceURLs: z.array(linksSchema),
    purposeOfResearch:z.string().min(1, {message: reqError("Purpose of Research")}),
    desiredOutputs: z.string().min(1, {message: reqError("Desired Outputs")}),
})