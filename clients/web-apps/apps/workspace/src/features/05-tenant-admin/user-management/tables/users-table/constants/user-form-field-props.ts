import { InputFieldProps, MultiSelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

// User Id
const idProps: InputFieldProps = {
  name: "id",
  label: "User ID",
  disabled: true,
};

// First Name
const firstNameProps: InputFieldProps = {
  name: "firstName",
  label: "First name",
  isRequired: true,
  description:
    "The user's first name.\n\n- **Max length:** 50 characters.\n- **Allowed characters:** letters only, with a single space between words.\n- **Can be changed** after creation.",
};

// Last Name
const lastNameProps: InputFieldProps = {
  name: "lastName",
  label: "Last name",
  isRequired: true,
  description:
    "The user's last name.\n\n- **Max length:** 50 characters.\n- **Allowed characters:** letters only, with a single space between words.\n- **Can be changed** after creation.",
};

// Email
const emailProps: InputFieldProps = {
  name: "email",
  label: "Email",
  isRequired: true,
  type: "email",
  description: "The user's email address.",
};

// User roles
const userRolesProps: MultiSelectFieldProps = {
  name: "userRoles",
  label: "User roles",
  isRequired: true,
  placeholder: "Select roles",
  description: "Select the roles to assign to the user.",
  selectOptions: [],
};

// User spaces
const userSpacesProps: MultiSelectFieldProps = {
  name: "spaces",
  label: "Spaces",
  isRequired: true,
  placeholder: "Select spaces",
  description: "Select the spaces the user belongs to.",
  selectOptions: [],
};

// Two Factor Enabled
const twoFactorEnabledProps: SwitchFieldProps = {
  name: "twoFactorEnabled",
  label: "Enable two-factor authentication (2FA)",
  description:
    "If enabled, user will need an additional verification step (e.g., one time password via email or code from an authenticator app) to log in, enhancing security",
};

// Unlock Account
const unlockAccountProps: SwitchFieldProps = {
  name: "unlockAccount",
  label: "Unlock account",
  description:
    "Unlocking the account will allow the user to log in again. Use caution if the account was locked due to security concerns",
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable record",
  description: "Disable this record if it's been outdated, or not required anymore",
};

// Lockout End
const lockoutEndProps: InputFieldProps = {
  name: "lockoutEnd",
  label: "Lockout ends at",
  disabled: true,
};

// Email Confirmed
const emailConfirmedProps: InputFieldProps = {
  name: "emailConfirmed",
  label: "Email confirmed",
  disabled: true,
};

// Pwd Set On
const pwdSetOnProps: InputFieldProps = {
  name: "pwdSetOn",
  label: "Password last set on",
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
  userRolesProps,
  userSpacesProps,
};
