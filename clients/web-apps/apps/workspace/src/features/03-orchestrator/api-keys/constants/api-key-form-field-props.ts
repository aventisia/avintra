import {
  type DateTimePickerFieldProps,
  type InputFieldProps,
  type SwitchFieldProps,
} from "@avplatform/ui/form";

// API Key Id
const idProps: InputFieldProps = {
  name: "id",
  label: "ID",
  disabled: true,
};

// API Key Name
const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  description:
    "A **friendly** name to identify this API key.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Can be changed** after creation.",
  isRequired: true,
  placeholder: "Production integration",
};

// Expiration date and time
const expiresAtProps: DateTimePickerFieldProps = {
  name: "expiresAt",
  label: "Expires at (optional)",
  description: "Optional. Leave blank to keep the key active indefinitely.",
  placeholder: "Select expiration date and time",
  hourCycle: 12,
  granularity: "minute",
};

// Revoke API key (update mode only)
const isRevokedProps: SwitchFieldProps = {
  name: "isRevoked",
  label: "Revoke access",
  description: "Turn off to block this key from accessing the API.",
};

export { expiresAtProps, idProps, isRevokedProps, nameProps };
