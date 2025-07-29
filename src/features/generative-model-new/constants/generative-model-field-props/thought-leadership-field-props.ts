import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const documentTypeProps: SelectFieldProps = {
    name: "documentType",
    label: "Document Type",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const topicProps: AutosizeTextareaFieldProps = {
    name: "topic",
    label: "Topic",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const industryProps: AutosizeTextareaFieldProps = {
    name: "industry",
    label: "Industry / Domain",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const purposeOfArticleProps: SelectFieldProps = {
    name: "purposeOfArticle",
    label: "Purpose of Article",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const toneAndStyleProps: SelectFieldProps = {
    name: "toneAndStyle",
    label: "Tone and Style",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const targetAudienceProps: AutosizeTextareaFieldProps = {
    name: "targetAudience",
    label: "Target Audience",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const dataAndStatsProps: SelectFieldProps = {
    name: "dataAndStats",
    label: "Data and Stats",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const outputLengthProps: AutosizeTextareaFieldProps = {
    name: "outputLength",
    label: "Output Length (in words)",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const outputStructureProps: AutosizeTextareaFieldProps = {
    name: "outputStructure",
    label: "Output Structure / Outline",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

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