import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const companyNameProps: AutosizeTextareaFieldProps = {
    name: "companyName",
    label: "Company Name",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const websiteLinkProps: AutosizeTextareaFieldProps = {
    name: "websiteLink",
    label: "Website Link",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
}

const focusAreaProps: SelectFieldProps = {
    name: "focusAreas",
    label: "Focus Area",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const webDataProps: SelectFieldProps = {
    name: "webData",
    label: "Web Data",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const summaryDepthProps: SelectFieldProps = {
    name: "summaryDepth",
    label: "Summary Depth",
    selectOptions: enumToArray({}),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

export {companyNameProps, websiteLinkProps, focusAreaProps, webDataProps,summaryDepthProps}