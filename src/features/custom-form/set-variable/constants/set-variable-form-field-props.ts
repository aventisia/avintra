import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";

const variableProps : InputFieldProps = {
    name: "variable",
    isRequired: true,
    type: "text",
    label: "Variable",
    className: "text-sm",
    placeholder: "",
}

const valueProps: TextareaFieldProps = {
    name: "value",
    isRequired:  true,
    label: "Value",
    className: "text-sm",
    placeholder: ""
}

export {variableProps, valueProps}