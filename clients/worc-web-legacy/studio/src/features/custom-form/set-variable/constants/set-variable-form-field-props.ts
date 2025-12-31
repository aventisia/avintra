import { InputFieldProps } from "@aventisia/ui/form";
import { TextareaFieldProps } from "@aventisia/ui/form";

const variableProps: InputFieldProps = {
  name: "variable",
  isRequired: true,
  type: "text",
  label: "Variable",
  className: "text-sm",
  placeholder: "",
};

const valueProps: TextareaFieldProps = {
  name: "value",
  isRequired: true,
  label: "Value",
  className: "text-sm",
  placeholder: "",
};

export { variableProps, valueProps };
