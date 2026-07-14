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
  name: "operatingSystem",
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
  label: "Host Name",
  isRequired: true,
  description: "Enter the host name of the machine.",
};

// Username
export const usernameProps: InputFieldProps = {
  name: "username",
  label: "Username",
  isRequired: true,
  description:
    "Enter the username of the machine that needs to be registered. This can be found on the login screen of the desktop app on the machine.",
};

// Os Unique Id
export const os_unique_idProps: InputFieldProps = {
  name: "osID",
  label: "OS Unique ID",
  placeholder: "",
  isRequired: true,
  description:
    "Enter the OS installation ID of the machine that needs to be registered. This can be found on the login screen of the desktop app on the machine.",
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
