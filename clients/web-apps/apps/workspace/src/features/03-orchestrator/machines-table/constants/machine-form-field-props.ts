import { InputFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

// Machine Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Machine Id",
  disabled: true,
};

// Host Name
export const hostnameProps: InputFieldProps = {
  name: "hostname",
  label: "Host Name",
  placeholder: "thinkpad-x1",
  disabled: true,
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
  label: "Machine Name",
  disabled: true,
  description: "Read-only machine name generated from the Username, OS Type, and OS Unique ID.",
};
