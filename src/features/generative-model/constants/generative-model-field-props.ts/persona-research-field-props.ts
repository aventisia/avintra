import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const personaNameProps: AutosizeTextareaFieldProps = {
    name: "personaResearch.personaName",
    label: "Persona Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const companyNameProps: AutosizeTextareaFieldProps = {
    name: "personaResearch.companyName",
    label: "Company Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const purposeOfResearchProps: SelectFieldProps = {
    name: "personaResearch.purposeOfResearch",
    label: "Purpose of research",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const desiredOutputsProps: SelectFieldProps = {
    name: "personaResearch.desiredOutputs",
    label: "Desired Outputs",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

export {personaNameProps,companyNameProps,purposeOfResearchProps, desiredOutputsProps}

// const personaResearchSchema = llmConfigZodSchema.extend({
//     personaName: z.string().min(1, {message: reqError("Persona Name")}),
//     companyName: z.string().min(1, {message: reqError("Company Name")}),
//     referenceURLs: z.string().min(1, {message: reqError("Reference URLS")}),
//     purposeOfResearch:z.string().min(1, {message: reqError("Purpose of Research")}),
//     desiredOutputs: z.string().min(1, {message: reqError("Desired Outputs")}),
// })