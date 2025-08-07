import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
// import { enumToArray } from "@aventisia/ui/utils";

const personaNameProps: AutosizeTextareaFieldProps = {
    name: "setupObject.personaName",
    label: "Persona Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const companyNameProps: AutosizeTextareaFieldProps = {
    name: "setupObject.companyName",
    label: "Company Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const purposeOfResearchProps: SelectFieldProps = {
    name: "setupObject.purposeOfResearch",
    label: "Purpose of research",
    // selectOptions: enumToArray({}),
    selectOptions: [{label: "Test POR 1", value: "test POR 1"}],
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const desiredOutputsProps: SelectFieldProps = {
    name: "setupObject.desiredOutput",
    label: "Desired Outputs",
    // selectOptions: enumToArray({}),
    selectOptions: [{label: "Test DOP 1", value: "test DOP 1"}],
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

export {personaNameProps,companyNameProps,purposeOfResearchProps, desiredOutputsProps}

