import { DataTypeEnum } from "@/react-toolkit/enums/data-type-enum";
import { CheckboxFieldProps } from "@/react-toolkit/ui/form/fields/CheckboxField";
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

const inputTextProps: TextareaFieldProps = {
    name: "inputText",
    label: "Input Text",
    placeholder: "It could be hard coded or a variable",
    isRequired: false,
    className: "text-sm resize-none"
} 

const fieldNameProps : InputFieldProps = {
    name: "",
    isRequired: false,
    type: "text",
    className: "text-sm",
    placeholder: "Field Name"
}

const typeProps: SelectFieldProps = {
    name: "",
    isRequired: false,
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
    isRequired: false,
    type: "text",
    className: "text-sm",
    placeholder: "Header Name"
}

const nodePropmptProps: TextareaFieldProps = {
    name: "nodePrompt",
    label: "Node Prompt",
    isRequired: false,
    className: "text-sm resize-none",
    rows: 4
}

const saveInModelLibraryProps: CheckboxFieldProps = {
    name: "saveInModelLibrary",
    label: "Save it in model library",
    className: "text-sm"
}

const modelNameProps: InputFieldProps = {
    name: "modelName",
    label: "Model Name",
    placeholder: "Enter Model Name",
    className: "text-sm",
}

export {
    documentContextProps,
    inputTextProps,
    fieldNameProps,
    tableNameProps,
    typeProps,
    instructionsProps,
    tableContextProps,
    headerNameProps,
    nodePropmptProps,
    saveInModelLibraryProps,
    modelNameProps
}