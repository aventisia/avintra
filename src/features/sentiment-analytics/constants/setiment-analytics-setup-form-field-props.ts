import { AutosizeTextareaFieldProps, InputFieldProps } from "@aventisia/ui/form";


const contextProps: AutosizeTextareaFieldProps = {
    name: "context",
    label: "Context",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const categoryNameProps : InputFieldProps = {
    name: "",
    isRequired: true,
    type: "text",
    className: "text-sm",
}

const instructionsProps: InputFieldProps = {
    name: "",
    type: "text",
    className: "text-sm",
}

const nodePropmptProps: AutosizeTextareaFieldProps = {
    name: "prompt",
    label: "Prompt",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none",
    rows: 4
}


export {
    contextProps,
    categoryNameProps,
    instructionsProps,
    nodePropmptProps,
}