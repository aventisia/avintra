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
  placeholder: "my-unique-machine",
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
export const agentProps: SelectFieldProps = {
  name: "flowVersionId",
  label: "Agent",
  isRequired: true,
  selectOptions: [{
    label: "Car",
    value: "ccf866e7-51e5-49f2-a547-b94e5b9cb84e"
  }, {
    label: "Agent 2",
    value: "b1567d4c-5bf0-4fbc-a849-4a92d5b35227"
  }],
};

// Agent multi
export const agentsProps: MultiSelectFieldProps = {
  name: "flowVersionId",
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