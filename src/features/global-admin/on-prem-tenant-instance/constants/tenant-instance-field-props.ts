import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";
import { OnPremInstanceTypesEnum } from "../enums/tenant-instance-type-enum";

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

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Instance Type",
  isRequired: true,
  selectOptions: enumToArray(OnPremInstanceTypesEnum),
};

// Disable Instance
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Instance",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

export { idProps, nameProps, typeProps, isDisabledProps };
