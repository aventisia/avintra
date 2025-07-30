import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const personaNameProps: AutosizeTextareaFieldProps = {
    name: "personaName",
    label: "Persona Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const companyNameProps: AutosizeTextareaFieldProps = {
    name: "companyName",
    label: "Company Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const purposeOfResearchProps: SelectFieldProps = {
    name: "purposeOfResearch",
    label: "Purpose of research",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const desiredOutputsProps: SelectFieldProps = {
    name: "desiredOutputs",
    label: "Desired Outputs",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

export {personaNameProps,companyNameProps,purposeOfResearchProps, desiredOutputsProps}

