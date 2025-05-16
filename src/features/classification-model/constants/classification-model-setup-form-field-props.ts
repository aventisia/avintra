import { SelectFieldProps } from "@/shared/select-field/SelectField";
import { AutosizeTextareaFieldProps, InputFieldProps, SwitchFieldProps } from "@aventisia/ui/form";
import { ISelectOption } from "@aventisia/ui/types";

const whenNoClearMatchSelectOptions: ISelectOption[] = [
    {
        label: "Discard Item",
        value: "discardItem",
        description: "Ignore the item and drop it from the output"
    },
    {
        label: "Output on Extra, ‘Other’ Branch",
        value: "outputOnExtra",
        description: "Create a separate output branch called ‘other’"
    }
]

const contextProps: AutosizeTextareaFieldProps = {
    name: "context",
    label: "Context",
    minHeight: 10,
    placeholder: "We need to pass Context to LLM",
    isRequired: true,
    className: "text-sm resize-none"
} 

const categoryNameProps : InputFieldProps = {
    name: "",
    isRequired: true,
    type: "text",
    className: "text-sm",
    placeholder: "Category"
}

const instructionsProps: InputFieldProps = {
    name: "",
    type: "text",
    className: "text-sm",
    placeholder: "Instructions"
}

const allowMultipleClassesProps: SwitchFieldProps = {
    name: "allowMultipleClasses",
    className: "text-sm",
    label: "Multiple Classes",
    description: "Allow multiple classes to be true",
}

const whenNoClearMatchProps: SelectFieldProps = {
    name: "whenNoClearMatch",
    className: "text-sm",
    placeholder: "Select",
    label: "When no clear match",
    selectOptions: whenNoClearMatchSelectOptions,
    isRequired: true,
}

const systemPromptProps: AutosizeTextareaFieldProps = {
    name: "prompt",
    label: "Prompt",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none",
    rows: 4
}

export {
    contextProps,
    categoryNameProps,
    instructionsProps,
    allowMultipleClassesProps,
    whenNoClearMatchProps,
    systemPromptProps,
}