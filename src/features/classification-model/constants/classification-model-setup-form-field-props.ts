import { AutosizeTextareaFieldProps, InputFieldProps, SwitchFieldProps } from "@aventisia/ui/form";


const contextProps: AutosizeTextareaFieldProps = {
    name: "context",
    label: "Context",
    minHeight: 10,
    placeholder: "We need to pass Context to LLM",
    isRequired: true,
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

const allowMultipleClassesProps: SwitchFieldProps = {
    name: "allowMultipleClasses",
    className: "text-sm",
    label: "Multiple Classes",
    description: "Allow multiple classes to be true",
}

const systemPromptProps: AutosizeTextareaFieldProps = {
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
    allowMultipleClassesProps,
    systemPromptProps,
}