import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { enumToArray } from "@aventisia/ui/utils";
import { SelectTaskEnum } from "../../enums/select-task-enum";
import { AutosizeTextareaFieldProps, InputFieldProps } from "@aventisia/ui/form";

const taskProps: SelectFieldProps = {
    name: "task",
    label: "Select Task",
    selectOptions: enumToArray(SelectTaskEnum),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
}

const fileNameProps : AutosizeTextareaFieldProps = {
    name: "",
    minHeight: 10,
    className: "text-sm resize-none",
    rows:2
}

const fileInstructionsProps: AutosizeTextareaFieldProps = {
    name: "",
    className: "text-sm resize-none",
    minHeight: 10,
}

const linkProps : InputFieldProps = {
    name: "",
    isRequired: true,
    className: "text-sm resize-none",
}

export {taskProps, fileNameProps, fileInstructionsProps, linkProps}