import { InputFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

// Machine Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Machine ID",
  disabled: true,
};

// Host Name
export const hostnameProps: InputFieldProps = {
  name: "hostname",
  label: "Host name",
  placeholder: "thinkpad-x1",
  disabled: true,
};

// Update-only disabled status
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable machine",
  description: "Disable this machine to prevent it from being used for job assignments.",
};

// Backend-generated machine name preview
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Machine name",
  disabled: true,
  description: "Read-only machine name generated from the username, OS type, and OS unique ID.",
};
