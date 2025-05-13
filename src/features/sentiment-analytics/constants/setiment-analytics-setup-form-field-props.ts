import { InputFieldProps } from "@aventisia/ui/form";
import { TextareaFieldProps } from "@aventisia/ui/form";


const contextProps: TextareaFieldProps = {
    name: "context",
    label: "Context",
    placeholder: "We need to pass Context to LLM",
    isRequired: false,
    className: "text-sm resize-none"
} 

const categoryNameProps : InputFieldProps = {
    name: "",
    isRequired: true,
    type: "text",
    className: "text-sm",
    placeholder: "Category"
}

const instructionsProps: InputFieldProps = {
    name: "",
    type: "text",
    className: "text-sm",
    placeholder: "Instructions"
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
    categoryNameProps,
    instructionsProps,
    nodePropmptProps,
}