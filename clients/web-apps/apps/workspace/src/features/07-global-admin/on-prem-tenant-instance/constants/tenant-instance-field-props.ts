import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

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
  description:
    "A **unique** name for the instance.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Can be changed** after creation.",
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
  description: "Disable this record if it's been outdated, or not required anymore",
};

export { idProps, nameProps, typeProps, isDisabledProps };
