import { AutosizeTextareaFieldProps, InputFieldProps } from "@aventisia/ui/form";


const contextProps: AutosizeTextareaFieldProps = {
    name: "context",
    label: "Context",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const totalMinWordsProps: InputFieldProps = {
    name: "totalMinimumWords",
    label: "Total Minimum Words",
    type: "number",
    min: 0,
    isRequired: true,
    className: "text-sm"
}

const totalMaxWordsProps: InputFieldProps = {
    name: "totalMaximumWords",
    label: "Total Maximum Words",
    type: "number",
    min: 0,
    isRequired: true,
    className: "text-sm"
}


const promptProps: AutosizeTextareaFieldProps = {
    name: "stuffPrompt",
    label: "Prompt",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 



export {
    contextProps,
    totalMinWordsProps,
    totalMaxWordsProps,
    promptProps
}