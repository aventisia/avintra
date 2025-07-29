import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";
import { llmConfigZodSchema } from "../components/llm-configuration/constants/llm-config-zod-schema";

const documentInstructionSchema = z.object({
  id: z.string().readonly(),
  filePath: z.string().readonly(),
  name: z.string().readonly(),
})

const linksSchema = z.object({
    id: z.string().readonly(),
    link: z.string().min(1, {message: reqError("Link")})
})

const thoughtLeadershipschema = llmConfigZodSchema.extend({
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

const companyDeepDivesSchema = llmConfigZodSchema.extend({
    companyName: z.string().min(1, {message: reqError("Company Name")}),
    websiteLink: z.string().min(1, {message: reqError("Website Link")}),
    focusAreas: z.string().min(1, {message: reqError("Focus Area")}),
    webData: z.string().min(1, {message: reqError("Web Data")}),
    links: z.array(linksSchema),
    documents: z.array(documentInstructionSchema).nullable(),
    summaryDepth: z.string().min(1, {message: reqError("Summary Depth")}),
})

const personaResearchSchema = llmConfigZodSchema.extend({
    personaName: z.string().min(1, {message: reqError("Persona Name")}),
    companyName: z.string().min(1, {message: reqError("Company Name")}),
    referenceURLs: z.array(linksSchema),
    purposeOfResearch:z.string().min(1, {message: reqError("Purpose of Research")}),
    desiredOutputs: z.string().min(1, {message: reqError("Desired Outputs")}),
})

const rfpRpiResponseGeneratorSchema = llmConfigZodSchema.extend({
    clientName:  z.string().min(1, {message: reqError("Client Name")}),
    clientLink:  z.string().min(1, {message: reqError("Client Link")}),
    rfiRfpDocuments: z.string().min(1, {message: reqError("Upload Documents")}),
    responseStrategy: z.string().min(1, {message: reqError("Response Strategy")}),
    links: z.array(linksSchema),
    responseBoundaries: z.string().min(1, {message: reqError("Response Boundaries")}),
    referenceDocuments: z.array(documentInstructionSchema).nullable(),
})

const documentDraftingSchema = llmConfigZodSchema.extend({
    documentTitle: z.string().min(1, {message: reqError("Document Title")}),
    documentType: z.string().min(1, {message: reqError("Document Type")}),
    guidelines: z.string().min(1, {message: reqError("Guidelines")}),
    outputStructure: z.string().min(1, {message: reqError("Output Structure")}),
    localizationNeeded: z.string().min(1, {message: reqError("Localization Needed")}),
    documents: z.array(documentInstructionSchema).nullable(),
})

export const generativeModelInputZodSchema = z.object({
    task: z.string().min(1, {message: reqError("Select Task")}),
    thoughtLeadership: thoughtLeadershipschema.nullable(),
    companyDeepDives: companyDeepDivesSchema.nullable(),
    personaResearch: personaResearchSchema.nullable(),
    rfpRpiResponseGenerator: rfpRpiResponseGeneratorSchema.nullable(),
    documentDrafting: documentDraftingSchema.nullable()
})