import { InputFieldProps, TextareaFieldProps } from "@aventisia/ui/form";

const summarizedTextProps: TextareaFieldProps = {
    name: "summarizedText",
    label: "Summarized Text",
    placeholder: "Summarized Text",
    isRequired: true,
    className: "text-sm resize-none"
} 

const totalMinWordsProps: InputFieldProps = {
    name: "totalMinWords",
    label: "Total Minimum Words",
    type: "number",
    placeholder: "00",
    isRequired: true,
    className: "text-sm"
}

const totalMaxWordsProps: InputFieldProps = {
    name: "totalMaxWords",
    label: "Total Maximum Words",
    type: "number",
    placeholder: "00",
    isRequired: true,
    className: "text-sm"
}

export {summarizedTextProps, totalMinWordsProps, totalMaxWordsProps}