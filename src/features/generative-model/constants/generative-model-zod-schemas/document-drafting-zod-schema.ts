import { llmConfigZodSchema } from "@/features/generative-model/components/llm-configuration/constants/llm-config-zod-schema";
import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

const documentInstructionSchema = z.object({
    id: z.string().readonly(),
    path: z.string().readonly(),
    name: z.string().readonly(),
})

const setupObjectSchema = z.object({
    documentTitle: z.string().min(1, {message: reqError("Document Title")}),
    documentType: z.string().min(1, {message: reqError("Document Type")}),
    guidelineInstruction: z.string().min(1, {message: reqError("Guidelines")}),
    outputStructure: z.string().min(1, {message: reqError("Output Structure")}),
    localizationNeeded: z.string().min(1, {message: reqError("Localization Needed")}),
    preferenceDocuments: z.array(documentInstructionSchema).nullable(),
})

const generativeModelSchema = llmConfigZodSchema.extend({
    name: z.string().readonly().default("DocumentDrafting"),
    setupObject: setupObjectSchema,
})

export const documentDraftingZodSchema = z.object({
    id: z.string().readonly(),
    generativeModel: generativeModelSchema,
})