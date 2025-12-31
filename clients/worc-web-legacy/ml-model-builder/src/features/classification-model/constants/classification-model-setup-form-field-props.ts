import { InputFieldProps, SwitchFieldProps } from "@aventisia/ui/form";

const categoryNameProps: InputFieldProps = {
  name: "",
  isRequired: true,
  type: "text",
  className: "text-sm",
};

const instructionsProps: InputFieldProps = {
  name: "",
  type: "text",
  className: "text-sm",
};

const allowMultipleClassesProps: SwitchFieldProps = {
  name: "classification.setupObject.allowMultipleClasses",
  className: "text-sm",
  label: "Multiple Classes",
  description: "Allow multiple classes to be true",
};

export { categoryNameProps, instructionsProps, allowMultipleClassesProps };
