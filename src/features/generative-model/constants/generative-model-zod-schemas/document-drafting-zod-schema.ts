import { llmConfigZodSchema } from "@/features/generative-model/components/llm-configuration/constants/llm-config-zod-schema";
import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

const documentInstructionSchema = z.object({
    id: z.string().readonly(),
    filePath: z.string().readonly(),
    name: z.string().readonly(),
})


export const documentDraftingZodSchema = llmConfigZodSchema.extend({
    taskName: z.string().readonly(),
    documentTitle: z.string().min(1, {message: reqError("Document Title")}),
    documentType: z.string().min(1, {message: reqError("Document Type")}),
    guidelines: z.string().min(1, {message: reqError("Guidelines")}),
    outputStructure: z.string().min(1, {message: reqError("Output Structure")}),
    localizationNeeded: z.string().min(1, {message: reqError("Localization Needed")}),
    documents: z.array(documentInstructionSchema).nullable(),
})