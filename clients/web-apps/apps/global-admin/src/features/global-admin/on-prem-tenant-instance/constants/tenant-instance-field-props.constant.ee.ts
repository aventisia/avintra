import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

import { OnPremInstanceTypesEnum } from "../enums/tenant-instance-type-enum.ee";

const INSTANCE_TYPE_LABELS: Record<OnPremInstanceTypesEnum, string> = {
  [OnPremInstanceTypesEnum.Prod]: "Production",
  [OnPremInstanceTypesEnum.NonProd]: "Non-production",
};

const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Name",
  isRequired: true,
  placeholder: "e.g. prod-eu-west",
  description:
    "A **unique** name for the instance.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Can be changed** after creation.",
};

const typeProps: SelectFieldProps = {
  name: "type",
  label: "Instance type",
  isRequired: true,
  placeholder: "Select a type",
  description: "Whether the instance runs production or non-production workloads.",
  selectOptions: Object.entries(INSTANCE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable instance",
  description: "Turn it off when it's outdated or no longer needed.",
};

export { INSTANCE_TYPE_LABELS, nameProps, typeProps, isDisabledProps };
