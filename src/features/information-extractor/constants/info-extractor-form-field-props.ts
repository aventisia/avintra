import { DataTypeEnum } from "@/react-toolkit/enums/data-type-enum";

import { InputFieldProps } from "@aventisia/ui/form";
import { SelectFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

const fieldNameProps: InputFieldProps = {
  name: "",
  isRequired: true,
  type: "text",
  className: "text-sm",
};

const typeProps: SelectFieldProps = {
  name: "",
  isRequired: true,
  selectOptions: enumToArray(DataTypeEnum),
  className: "text-sm",
};

const instructionsProps: InputFieldProps = {
  name: "",
  type: "text",
  className: "text-sm",
};

const tableContextProps: InputFieldProps = {
  name: "tableContext",
  label: "Table Context",
  isRequired: false,
  type: "text",
  className: "text-sm",
};

const tableNameProps: InputFieldProps = {
  name: "tableName",
  fieldSize: "sm",
  className: "h-7 w-24 bg-transparent",
};

const headerNameProps: InputFieldProps = {
  name: "",
  isRequired: true,
  type: "text",
  className: "text-sm",
};

export {
  fieldNameProps,
  tableNameProps,
  typeProps,
  instructionsProps,
  tableContextProps,
  headerNameProps,
};
