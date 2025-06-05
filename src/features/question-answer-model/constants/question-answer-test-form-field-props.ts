import {  AutosizeTextareaFieldProps, CheckboxFieldProps } from "@aventisia/ui/form";

const answerProps : AutosizeTextareaFieldProps = {
    name: "",
    className: "text-sm resize-none",
    minHeight: 10,
}

const submitForFineTuningProps: CheckboxFieldProps = {
    name: "submitForFineTuning",
    label: "",
    className: "text-sm",
}


export {answerProps, submitForFineTuningProps}