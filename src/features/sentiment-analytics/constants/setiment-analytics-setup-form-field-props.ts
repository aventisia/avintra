import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum";
import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps, InputFieldProps } from "@aventisia/ui/form";
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

const nodePropmptProps: AutosizeTextareaFieldProps = {
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
    nodePropmptProps,
    modelTypeProps
}