import { CheckboxFieldProps, InputFieldProps } from "@aventisia/ui/form";

const accuracyValueProps : InputFieldProps = {
    name: "",
    type: "number",
    className: "text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-16 text-center py-0 h-8",
}

const submitForFineTuningProps: CheckboxFieldProps = {
    name: "submitForFineTuning",
    label: "",
    className: "text-sm",
}


export {accuracyValueProps, submitForFineTuningProps}