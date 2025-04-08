import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { MultiSelectFieldProps } from "@/react-toolkit/ui/form/fields/MultiSelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";

// Role Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Role Id",
  disabled: true,
};

// First Name
const firstNameProps: InputFieldProps = {
  name: "firstName",
  label: "First Name",
  isRequired: true,
};

// Last Name
const lastNameProps: InputFieldProps = {
  name: "lastName",
  label: "Last Name",
  isRequired: true,
};

// Email
const emailProps: InputFieldProps = {
  name: "email",
  label: "Email",
  isRequired: true,
  type: "email",
};

// Role roles
const roleRolesProps: MultiSelectFieldProps = {
  name: "roleRoles",
  label: "Roles",
  isRequired: true,
  placeholder: "Select roles",
  selectOptions: [],
};

// Two Factor Enabled
const twoFactorEnabledProps: SwitchFieldProps = {
  name: "twoFactorEnabled",
  label: "Enable Two-Factor Authentication (2FA)",
  description:
    "If enabled, role will need an additional verification step (e.g., one time password via email or code from an authenticator app) to log in, enhancing security",
};

// Unlock Account
const unlockAccountProps: SwitchFieldProps = {
  name: "unlockAccount",
  label: "Unlock Account",
  description:
    "Unlocking the account will allow the role to log in again. Use caution if the account was locked due to security concerns",
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

// Lockout End
const lockoutEndProps: InputFieldProps = {
  name: "lockoutEnd",
  label: "Lockout Ends At",
  disabled: true,
};

// Email Confirmed
const emailConfirmedProps: InputFieldProps = {
  name: "emailConfirmed",
  label: "Email Confirmed",
  disabled: true,
};

// Pwd Set On
const pwdSetOnProps: InputFieldProps = {
  name: "pwdSetOn",
  label: "Password Last Set On",
  disabled: true,
};

export {
  emailConfirmedProps,
  emailProps,
  firstNameProps,
  idProps,
  isDisabledProps,
  lastNameProps,
  lockoutEndProps,
  pwdSetOnProps,
  twoFactorEnabledProps,
  unlockAccountProps,
  roleRolesProps,
};
