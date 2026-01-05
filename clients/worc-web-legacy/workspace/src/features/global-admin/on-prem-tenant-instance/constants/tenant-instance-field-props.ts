import { InputFieldProps, SwitchFieldProps } from "@aventisia/ui/form";

// Instance Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Instance Id",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Name",
  isRequired: true,
};

// Disable Instance
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Instance",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

export { idProps, nameProps, isDisabledProps };
