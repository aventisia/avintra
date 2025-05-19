import { InputFieldProps } from "@aventisia/ui/form";
import { SelectFieldProps } from "@aventisia/ui/form";
import { TextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";
import { DataTypeEnum } from "../enums/data-type-enum";
import { ColorEnum } from "../enums/color-enum";

// Model Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Model Id",
  disabled: true,
};
//color
const colorProps: SelectFieldProps = {
  name: "color",
  label: "Color",
  isRequired: true,
  selectOptions: enumToArray(ColorEnum),
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  isRequired: true,
  selectOptions: enumToArray(DataTypeEnum),
};

// Name
const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
};

export { descriptionProps, idProps, nameProps, typeProps, colorProps };
