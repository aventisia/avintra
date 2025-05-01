import { DataTypeEnum } from "@/react-toolkit/enums/data-type-enum";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

const documentContextProps: TextareaFieldProps = {
    name: "documentContext",
    label: "Document Context",
    placeholder: "We need to pass Document Context to LLM",
    isRequired: false,
    className: "text-sm resize-none"
} 

const fieldNameProps : InputFieldProps = {
    name: "",
    isRequired: true,
    type: "text",
    className: "text-sm",
    placeholder: "Field Name"
}

const typeProps: SelectFieldProps = {
    name: "",
    isRequired: true,
    placeholder: "Select",
    selectOptions: enumToArray(DataTypeEnum),
    className: "text-sm"
}

const instructionsProps: InputFieldProps = {
    name: "",
    type: "text",
    className: "text-sm",
    placeholder: "Instructions"
}

const tableContextProps: InputFieldProps = {
    name: "tableContext",
    label: "Table Context",
    isRequired: false,
    type: "text",
    className: "text-sm",
    placeholder: "Table context"
}

const tableNameProps: InputFieldProps = {
    name: "tableName",
    fieldSize: "sm",
    maxLength: 20,
    className: "h-7 w-24 bg-transparent",
}

const headerNameProps: InputFieldProps = {
    name: "",
    isRequired: true,
    type: "text",
    className: "text-sm",
    placeholder: "Header Name"
}

const nodePropmptProps: TextareaFieldProps = {
    name: "nodePrompt",
    label: "Node Prompt",
    isRequired: true,
    className: "text-sm resize-none",
    rows: 4
}


export {
    documentContextProps,
    fieldNameProps,
    tableNameProps,
    typeProps,
    instructionsProps,
    tableContextProps,
    headerNameProps,
    nodePropmptProps,
}