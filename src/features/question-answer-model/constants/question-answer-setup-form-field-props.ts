import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";


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

export {
    questionProps,
    instructionsProps,
}