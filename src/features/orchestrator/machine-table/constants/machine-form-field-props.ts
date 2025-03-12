import { MachineEnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import { MachineOsTypesEnum } from "@/react-toolkit/enums/machine-os-types-enum";
import { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import type { MultiSelectFieldProps } from "@/react-toolkit/ui/form/fields/MultiSelectField";
import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";

// machine Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Machine Id",
  disabled: true,
};

// Type
export const typeProps: SelectFieldProps = {
  name: "type",
  label: "OS Type",
  isRequired: true,
  selectOptions: enumToArray(MachineOsTypesEnum),
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Unique Name",
  placeholder: "exampleMachine",
  isRequired: true,
};

// Host Name
export const hostnameProps: InputFieldProps = {
  name: "hostname",
  label: "Host Name",
  placeholder: "example.com",
  isRequired: true,
};

// IP Address
export const ipAddressProps: InputFieldProps = {
  name: "ipAddress",
  label: "IP Address",
  isRequired: true,
  placeholder: "123.2.12.123"
};

// Type of Environmnet
export const typeEnvironmentProps: SelectFieldProps = {
  name: "environment",
  label: "Environment Type",
  isRequired: true,
  selectOptions: enumToArray(MachineEnvironmentTypesEnum),
};

// Type of Status
export const typeStatusProps: SelectFieldProps = {
  name: "status",
  label: "Status",
  isRequired: true,
  selectOptions: enumToArray(MachineStatusTypesEnum),
};

// Agent multi
export const agentsProps: MultiSelectFieldProps = {
  name: "agentIds",
  label: "Agents",
  isRequired: true,
  placeholder: "Select Agent(s)",
  selectOptions: [],
};



// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};