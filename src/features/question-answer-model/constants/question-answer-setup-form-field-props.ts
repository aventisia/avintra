import { TextareaFieldProps } from "@aventisia/ui/form";


const contextProps: TextareaFieldProps = {
    name: "context",
    label: "Context",
    placeholder: "We need to pass Context to LLM",
    isRequired: false,
    className: "text-sm resize-none"
} 

const questionProps : TextareaFieldProps = {
    name: "",
    isRequired: true,
    className: "text-sm resize-none",
    placeholder: "Write a question",
    rows:2
}

const instructionsProps: TextareaFieldProps = {
    name: "",
    className: "text-sm resize-none",
    placeholder: "Instructions",
    rows: 2
}

const nodePropmptProps: TextareaFieldProps = {
    name: "nodePrompt",
    label: "Node Prompt",
    isRequired: true,
    className: "text-sm resize-none",
    rows: 4
}


export {
    contextProps,
    questionProps,
    instructionsProps,
    nodePropmptProps,
}