import {  InputFieldProps } from "@aventisia/ui/form";

const totalMinWordsProps: InputFieldProps = {
    name: "summarization.setupObject.totalMinimumWords",
    label: "Total Minimum Words",
    type: "number",
    min: 0,
    isRequired: true,
    className: "text-sm"
}

const totalMaxWordsProps: InputFieldProps = {
    name: "summarization.setupObject.totalMaximumWords",
    label: "Total Maximum Words",
    type: "number",
    min: 0,
    isRequired: true,
    className: "text-sm"
}

export {
    totalMinWordsProps,
    totalMaxWordsProps,
}