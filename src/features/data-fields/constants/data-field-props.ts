import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";
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
  label: "Field",
  isRequired: true,
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
};

export { descriptionProps, idProps, nameProps, typeProps, colorProps };
