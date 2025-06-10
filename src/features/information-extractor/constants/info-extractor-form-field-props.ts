import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum";
import { DataTypeEnum } from "@/react-toolkit/enums/data-type-enum";
import { AutosizeTextareaFieldProps, InputFieldProps } from "@aventisia/ui/form";
import { SelectFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";


const documentContextProps: AutosizeTextareaFieldProps = {
    name: "context",
    label: "Context",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none"
} 

const fieldNameProps : InputFieldProps = {
    name: "",
    isRequired: true,
    type: "text",
    className: "text-sm",
}

const typeProps: SelectFieldProps = {
    name: "",
    isRequired: true,
    selectOptions: enumToArray(DataTypeEnum),
    className: "text-sm"
}

const instructionsProps: InputFieldProps = {
    name: "",
    type: "text",
    className: "text-sm",
}

const tableContextProps: InputFieldProps = {
    name: "tableContext",
    label: "Table Context",
    isRequired: false,
    type: "text",
    className: "text-sm",
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
}

const nodePropmptProps: AutosizeTextareaFieldProps = {
    name: "prompt",
    label: "Prompt",
    minHeight: 10,
    isRequired: true,
    className: "text-sm resize-none",
    rows: 4
}

const modelTypeProps: SelectFieldProps = {
    name: "llm",
    label: "Model",
    selectOptions: enumToArray(ModelLLMEnum),
    placeholder: "Select",
    isRequired: true,
    className: "text-sm resize-none"
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
    modelTypeProps
}