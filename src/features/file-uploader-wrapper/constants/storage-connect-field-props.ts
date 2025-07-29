import { SelectFieldProps } from "@/shared/select-field/SelectField"
import { InputFieldProps } from "@aventisia/ui/form"
import { enumToArray } from "@aventisia/ui/utils"
import { ScopeEnum } from "../enums/scope-enum"
// import { CredentailsEnum } from "../enums/credentails-enum"

const credentailsProps: SelectFieldProps = {
    name: "credentails",
    label: "Credentials",
    isRequired: true,
    className: "text-sm",
    selectOptions: [],
    placeholder: "Select"
} 

const scopeProps: SelectFieldProps = {
    name: "scope",
    label: "Scope",
    isRequired: true,
    className: "text-sm",
    selectOptions: enumToArray(ScopeEnum),
    placeholder: "Select"

} 

const fileIdProps: InputFieldProps = {
    name: "fileId",
    label: "File Id",
    isRequired: true,
    className: "text-sm"
} 

const folderIdProps: InputFieldProps = {
    name: "folderId",
    label: "Folder Id",
    isRequired: true,
    className: "text-sm"
} 

export {credentailsProps, scopeProps, fileIdProps, folderIdProps}