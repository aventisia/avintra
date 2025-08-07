import { llmConfigZodSchema } from "@/features/generative-model/components/llm-configuration/constants/llm-config-zod-schema";
import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

const linksSchema = z.object({
    id: z.string().readonly(),
    url: z.string().min(1, {message: reqError("Link")})
})

const setupObjectSchema = z.object({
    personaName: z.string().min(1, {message: reqError("Persona Name")}),
    companyName: z.string().min(1, {message: reqError("Company Name")}),
    purposeOfResearch:z.string().min(1, {message: reqError("Purpose of Research")}),
    links: z.array(linksSchema),
    desiredOutput: z.string().min(1, {message: reqError("Desired Outputs")}),
})

export const personaResearchZodSchema = llmConfigZodSchema.extend({
    name: z.string().readonly().default("PersonaResearch"),
    setupObject: setupObjectSchema,
})