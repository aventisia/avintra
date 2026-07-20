import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { EnvironmentTypesEnum } from "@/react-toolkit/enums/environment-types-enum";
import { OsTypesEnum } from "@/react-toolkit/enums/os-types-enum";

// Machine Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Machine Id",
  disabled: true,
};

// Type of Environment
export const environmentTypeProps: SelectFieldProps = {
  name: "environment",
  label: "Environment",
  isRequired: true,
  selectOptions: enumToArray(EnvironmentTypesEnum),
};

// Machine Operating System Type
export const osTypeProps: SelectFieldProps = {
  name: "operatingSystem",
  label: "OS Type",
  isRequired: true,
  selectOptions: enumToArray(OsTypesEnum),
};

const osUniqueIdPlaceholders: Record<string, string> = {
  [OsTypesEnum.Windows]: "9508dd1e-4530-4c37-836c-834ae48c1604",
  [OsTypesEnum.Linux]: "46cf14985742d9c176a811e04e00c899",
};

// OS Unique Id
export const getOsUniqueIdProps = (operatingSystem: string): InputFieldProps => ({
  name: "osID",
  label: "OS Unique ID",
  placeholder: osUniqueIdPlaceholders[operatingSystem] ?? "00000000-0000-0000-0000-000000000000",
  isRequired: true,
  description:
    "Enter the OS installation ID of the machine that needs to be registered. This can be found on the login screen of the desktop app on the machine.",
});

// Username
export const usernameProps: InputFieldProps = {
  name: "username",
  label: "Username",
  placeholder: "johnsmith",
  isRequired: true,
  description:
    "Enter the username of the machine that needs to be registered. This can be found on the login screen of the desktop app on the machine.",
};

// Host Name
export const hostnameProps: InputFieldProps = {
  name: "hostname",
  label: "Host Name",
  placeholder: "thinkpad-x1",
  isRequired: true,
  description: "Enter the host name of the machine.",
};

// IP Address
export const ipAddressProps: InputFieldProps = {
  name: "ipAddress",
  label: "IP Address (optional)",
  placeholder: "0.0.0.0 or 2001:0db8:85a3:0000:0000:8a2e:0370:7334",
};

// Update-only disabled status
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Machine",
  description: "Disable this machine to prevent it from being used for job assignments.",
};

// Backend-generated machine name preview
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Machine Name (preview)",
  disabled: true,
  description:
    "Read-only preview generated from Username, Environment Type, OS Type, and OS Unique ID.",
};
