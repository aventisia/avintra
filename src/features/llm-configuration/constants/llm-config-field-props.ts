import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum"
import { SelectFieldProps } from "@/shared/select-field/SelectField"
import { AutosizeTextareaFieldProps } from "@aventisia/ui/form"
import { enumToArray } from "@aventisia/ui/utils"

const nodePromptProps: AutosizeTextareaFieldProps = {
    name: "",
    label: "Prompt",
    minHeight: 10,
    isRequired: true,
    className: "text-sm"
}

const baseLlmProps: SelectFieldProps = {
    name: "",
    label: "Base LLM",
    selectOptions: enumToArray(ModelLLMEnum),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

export {nodePromptProps, baseLlmProps}