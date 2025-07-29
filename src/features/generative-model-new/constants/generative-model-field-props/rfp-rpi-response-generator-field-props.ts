import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const clientNameProps: AutosizeTextareaFieldProps = {
    name: "clientName",
    label: "Client / Bidder Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const clientLinkProps: AutosizeTextareaFieldProps = {
    name: "clientLink",
    label: "Client / Bidder Website Link",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const responseStrategyProps: SelectFieldProps = {
    name: "responseStrategy",
    label: "Response Strategy",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const responseBoundariesProps: SelectFieldProps = {
    name: "responseBoundaries",
    label: "Response Boundaries",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

export {clientNameProps, clientLinkProps, responseStrategyProps, responseBoundariesProps}