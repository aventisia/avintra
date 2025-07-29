import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const documentTypeProps: SelectFieldProps = {
    name: "thoughtLeadership.documentType",
    label: "Document Type",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const topicProps: AutosizeTextareaFieldProps = {
    name: "thoughtLeadership.topic",
    label: "Topic",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const industryProps: AutosizeTextareaFieldProps = {
    name: "thoughtLeadership.industry",
    label: "Industry / Domain",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const purposeOfArticleProps: SelectFieldProps = {
    name: "thoughtLeadership.purposeOfArticle",
    label: "Purpose of Article",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const toneAndStyleProps: SelectFieldProps = {
    name: "thoughtLeadership.toneAndStyle",
    label: "Tone and Style",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const targetAudienceProps: AutosizeTextareaFieldProps = {
    name: "thoughtLeadership.targetAudience",
    label: "Target Audience",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const dataAndStatsProps: SelectFieldProps = {
    name: "thoughtLeadership.dataAndStats",
    label: "Data and Stats",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const outputLengthProps: AutosizeTextareaFieldProps = {
    name: "thoughtLeadership.outputLength",
    label: "Output Length (in words)",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const outputStructureProps: AutosizeTextareaFieldProps = {
    name: "thoughtLeadership.outputStructure",
    label: "Output Structure / Outline",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

// const thoughtLeadershipschema = z.object({
//     documentType: z.string().min(1, {message: reqError("Document Type")}),
//     topic: z.string().min(1, {message: reqError("Topic")}),
//     industry: z.string().min(1, {message: reqError("Industry")}),
//     purposeOfArticle: z.string().min(1, {message: reqError("Purpose Of Article")}),
//     toneAndStyle: z.string().min(1, {message: reqError("Tone and Style")}),
//     targetAudience: z.string().min(1, {message: reqError("Target Audience")}),
//     dataAndStats: z.string().min(1, {message: reqError("Data and Stats")}),
//     links: z.array(z.string()),
//     documents: z.array(documentInstructionSchema).nullable(),
//     outputLength: z.string().min(1, {message: reqError("Output Length")}),
//     outputStructure: z.string().min(1, {message: reqError("Output Structure")})
// })

export {
    documentTypeProps, 
    topicProps, 
    industryProps, 
    purposeOfArticleProps, 
    toneAndStyleProps, 
    targetAudienceProps, 
    dataAndStatsProps,
    outputStructureProps,
    outputLengthProps,
}