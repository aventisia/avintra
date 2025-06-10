import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum";
import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";


const contextProps: AutosizeTextareaFieldProps = {
    name: "context",
    label: "Context",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const questionProps : AutosizeTextareaFieldProps = {
    name: "",
    isRequired: true,
    minHeight: 10,
    className: "text-sm resize-none",
    rows:2
}

const instructionsProps: AutosizeTextareaFieldProps = {
    name: "",
    className: "text-sm resize-none",
    minHeight: 10,
}

const nodePropmptProps: AutosizeTextareaFieldProps = {
    name: "prompt",
    label: "Prompt",
    isRequired: true,
    className: "text-sm resize-none",
    minHeight: 10,
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
    questionProps,
    instructionsProps,
    nodePropmptProps,
    modelTypeProps
}