import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";


const contextProps: AutosizeTextareaFieldProps = {
    name: "context",
    label: "Context",
    minHeight: 10,
    placeholder: "We need to pass Context to LLM",
    isRequired: true,
    className: "text-sm resize-none"
} 

const questionProps : AutosizeTextareaFieldProps = {
    name: "",
    isRequired: true,
    minHeight: 10,
    className: "text-sm resize-none",
    placeholder: "Write a question",
    rows:2
}

const instructionsProps: AutosizeTextareaFieldProps = {
    name: "",
    className: "text-sm resize-none",
    placeholder: "Instructions",
    minHeight: 10,
}

const nodePropmptProps: AutosizeTextareaFieldProps = {
    name: "prompt",
    label: "Prompt",
    isRequired: true,
    className: "text-sm resize-none",
    minHeight: 10,
}


export {
    contextProps,
    questionProps,
    instructionsProps,
    nodePropmptProps,
}