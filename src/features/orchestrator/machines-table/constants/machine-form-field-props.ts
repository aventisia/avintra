import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { MachineEnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import { MachineOsTypesEnum } from "@/react-toolkit/enums/machine-os-types-enum";

// Machine Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Machine Id",
  disabled: true,
};

// Machine Type - Only view/edit mode
export const osTypeProps: SelectFieldProps = {
  name: "type",
  label: "OS Type",
  isRequired: true,
  selectOptions: enumToArray(MachineOsTypesEnum),
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  autoFocus: true,
};

// Host Name
export const hostnameProps: InputFieldProps = {
  name: "hostname",
  label: "Hostname/Username",
  isRequired: true,
  description:
    "To find your operating system's hostname/username, open the desktop app and check the login screen for the hostname/username displayed there.",
};

// Os Unique Id
export const os_unique_idProps: InputFieldProps = {
  name: "osId",
  label: "OS Unique ID",
  placeholder: "",
  isRequired: true,
  description:
    "To find your operating system's unique ID, open the desktop app and check the login screen for the os_id displayed there.",
};

// IP Address
export const ipAddressProps: InputFieldProps = {
  name: "ipAddress",
  label: "IP Address",
  isRequired: true,
  placeholder: "123.2.12.123",
};

// Type of Environmnet
export const environmentTypeProps: SelectFieldProps = {
  name: "environment",
  label: "Environment Type",
  isRequired: true,
  selectOptions: enumToArray(MachineEnvironmentTypesEnum),
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Machine",
  description:
    "Disable this machine if it's not in use, or not required anymore",
};
