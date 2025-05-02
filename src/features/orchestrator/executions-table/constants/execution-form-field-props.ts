import { InputFieldProps } from "@aventisia/ui/form";
import { SwitchFieldProps } from "@aventisia/ui/form";

// execution Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Execution Id",
  disabled: true,
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};
