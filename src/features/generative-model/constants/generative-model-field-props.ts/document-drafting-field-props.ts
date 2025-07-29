import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";

const documentTitleProps: AutosizeTextareaFieldProps = {
    name: "documentDrafting.documentTitle",
    label: "Document Title",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const documentTypeProps: AutosizeTextareaFieldProps = {
    name: "documentDrafting.documentType",
    label: "Document Type",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const guidelinesProps: AutosizeTextareaFieldProps = {
    name: "documentDrafting.guidelines",
    label: "Guidelines / Instructions",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const outputStructureProps: AutosizeTextareaFieldProps = {
    name: "documentDrafting.outputStructure",
    label: "Output Structure",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const localizationNeededProps: AutosizeTextareaFieldProps = {
    name: "documentDrafting.localizationNeeded",
    label: "Localization Needed",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

export {documentTitleProps, documentTypeProps, guidelinesProps, outputStructureProps, localizationNeededProps}

// const documentDraftingSchema = llmConfigZodSchema.extend({
//     documentTitle: z.string().min(1, {message: reqError("Document Title")}),
//     documentType: z.string().min(1, {message: reqError("Document Type")}),
//     guidelines: z.string().min(1, {message: reqError("Guidelines")}),
//     outputStructure: z.string().min(1, {message: reqError("Output Structure")}),
//     localizationNeeded: z.string().min(1, {message: reqError("Localization Needed")}),
//     documents: z.array(documentInstructionSchema).nullable(),
// })