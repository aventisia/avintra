import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum";
import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps, InputFieldProps, SwitchFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";


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

const modelTypeProps: SelectFieldProps = {
    name: "llm",
    label: "Model",
    selectOptions: enumToArray(ModelLLMEnum),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
} 
export {
    contextProps,
    categoryNameProps,
    instructionsProps,
    allowMultipleClassesProps,
    systemPromptProps,
    modelTypeProps,
}