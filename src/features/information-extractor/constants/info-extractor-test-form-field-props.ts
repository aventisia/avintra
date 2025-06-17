import { CheckboxFieldProps, InputFieldProps } from "@aventisia/ui/form";

const fieldValueProps : InputFieldProps = {
    name: "",
    type: "text",
    className: "text-sm",
}

const submitForFineTuningProps: CheckboxFieldProps = {
    name: "submitForFineTuning",
    label: "",
    className: "text-sm",
}

export {fieldValueProps, submitForFineTuningProps}