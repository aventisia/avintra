import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";
import { DesiredOutputsEnums } from "../../enums/persona-research/desired-outputs-enum";
import { PurposeOfResearchEnum } from "../../enums/persona-research/purpose-of-research-enum";

const personaNameProps: AutosizeTextareaFieldProps = {
    name: "generativeModel.setupObject.personaName",
    label: "Persona Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const companyNameProps: AutosizeTextareaFieldProps = {
    name: "generativeModel.setupObject.companyName",
    label: "Company Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const purposeOfResearchProps: SelectFieldProps = {
    name: "generativeModel.setupObject.purposeOfResearch",
    label: "Purpose of research",
    selectOptions: enumToArray(PurposeOfResearchEnum),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const desiredOutputsProps: SelectFieldProps = {
    name: "generativeModel.setupObject.desiredOutput",
    label: "Desired Outputs",
    selectOptions: enumToArray(DesiredOutputsEnums),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

export {personaNameProps,companyNameProps,purposeOfResearchProps, desiredOutputsProps}

