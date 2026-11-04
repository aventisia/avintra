import { InputFieldProps, MultiSelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

const firstNameProps: InputFieldProps = {
  name: "firstName",
  label: "First name",
  isRequired: true,
  placeholder: "e.g. Jane",
  description:
    "The user's first name.\n\n- **Max length:** 50 characters.\n- **Allowed characters:** letters only, with a single space between words.\n- **Can be changed** after creation.",
};

const lastNameProps: InputFieldProps = {
  name: "lastName",
  label: "Last name",
  isRequired: true,
  placeholder: "e.g. Doe",
  description:
    "The user's last name.\n\n- **Max length:** 50 characters.\n- **Allowed characters:** letters only, with a single space between words.\n- **Can be changed** after creation.",
};

const emailProps: InputFieldProps = {
  name: "email",
  label: "Email",
  isRequired: true,
  type: "email",
  placeholder: "e.g. jane.doe@company.com",
  description: "The user's email address. The invitation is sent here.",
};

const userRolesProps: MultiSelectFieldProps = {
  name: "userRoles",
  label: "Roles",
  isRequired: true,
  placeholder: "Select roles",
  description: "Roles decide what the user can see and change.",
  selectOptions: [],
};

const userSpacesProps: MultiSelectFieldProps = {
  name: "spaces",
  label: "Spaces",
  isRequired: true,
  placeholder: "Select spaces",
  description: "Spaces the user can work in. The default space is always included.",
  selectOptions: [],
};

const twoFactorEnabledProps: SwitchFieldProps = {
  name: "twoFactorEnabled",
  label: "Two-factor authentication",
  description: "Ask for a one-time code from email or an authenticator app at sign-in",
};

const unlockAccountProps: SwitchFieldProps = {
  name: "unlockAccount",
  label: "Unlock account",
  description: "Let the user sign in again. Check first if it was locked for security reasons",
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable user",
  description: "The user can no longer sign in until enabled again",
};

export {
  emailProps,
  firstNameProps,
  isDisabledProps,
  lastNameProps,
  twoFactorEnabledProps,
  unlockAccountProps,
  userRolesProps,
  userSpacesProps,
};
