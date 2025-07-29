import { SelectFieldProps } from "@/shared/select-field/SelectField";
import {   AutosizeTextareaFieldProps, InputFieldProps, MultiSelectFieldProps } from "@aventisia/ui/form";


const templateNameProps: InputFieldProps = {
    name: "name",
    label: "Template Name",
    className: "text-sm",
    isRequired: true,
}

const descriptionProps: AutosizeTextareaFieldProps = {
    name: "description",
    label: "Description",
    minHeight: 10,
    className: "text-sm",
}

const accessLevelFieldProps: SelectFieldProps = {
    name: "accessType",
    label: "Access Level",
    className: "text-sm",
    selectOptions: [
        {label: "Space", value: "Space", description: "Shared within your current Worc Space team."},
        {label: "Tenant", value: "TenantLevel", description: "Available to all users under your organization’s tenant."},
        {label: "Public", value: "Public", description: "Anyone using the platform can view and use this template."},
     ],
    isRequired: true,
    placeholder: "Select"
}

const worcspacesFieldProps: MultiSelectFieldProps = {
    name: "spaceIds",
    label: "Spaces",
    className: "text-sm",
    isRequired: true,
    placeholder: "Select",
    selectOptions : [
        {label: "Worc-space 1", value: "worcspace-1"}, 
        {label: "Worc-space 2", value: "worcspace-2", }, 
        {label: "Worc-space 3", value: "worcspace-3"}
    ]
}



export { accessLevelFieldProps, worcspacesFieldProps, templateNameProps, descriptionProps}