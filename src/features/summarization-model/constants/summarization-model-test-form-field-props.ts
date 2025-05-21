import { AutosizeTextareaFieldProps, CheckboxFieldProps } from "@aventisia/ui/form";

const summarizedTextProps: AutosizeTextareaFieldProps = {
    name: "summarizedText",
    placeholder: "Summarized Text",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const submitForFineTuningProps: CheckboxFieldProps = {
    name: "submitForFineTuning",
    label: "",
    className: "text-sm",
}

export {summarizedTextProps, submitForFineTuningProps}